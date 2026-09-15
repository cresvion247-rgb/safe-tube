// The SafeTube Video Library — the single source of every child feed.
// Videos are imported from the Default Trusted Channel Registry by the
// admin/parent-controlled refresh process and then play purely from local
// storage: child sessions make zero YouTube discovery or resolution calls.
import { ALL_AGE_GROUPS, ENTERTAINMENT_CATEGORY } from "@/domain/constants";
import { applyWhitelistGates } from "@/domain/gates";
import { whitelistForAge } from "@/data/whitelist";
import { activeRegistryForAge, confirmedChannelsForAge } from "@/app/vetting";
import {
  getCached,
  putCached,
  listCustomChannels,
  listLibraryChannels,
  putLibraryChannel,
  listLibraryVideos,
  libraryVideosForAge,
  putLibraryVideos,
} from "@/adapters/localDb";
import { resolveChannels, fetchChannelUploads, YoutubeApiError } from "@/adapters/youtubeClient";

const META_KEY = "library:meta";
const SCANNED_KEY = "library:scanned";
const IDS_KEY = "channelIds"; // permanent channel-name → channelId map
const IMPORT_BATCH = 8; // channels per first-run import batch (bounds quota use)
const REFRESH_CHANNELS = 8; // channels scanned per library refresh
const HEAL_PER_REFRESH = 2; // unresolved channels retried per refresh
const AUTO_REFRESH_MS = 24 * 60 * 60 * 1000;

export async function defaultTrustedChannels() {
  const seen = new Set();
  const out = [];
  for (const group of ALL_AGE_GROUPS) {
    for (const channel of await activeRegistryForAge(group)) {
      if (seen.has(channel.name)) continue;
      seen.add(channel.name);
      out.push({ ...channel, ageGroup: group, isDefaultTrusted: true, source: "registry" });
    }
    for (const channel of whitelistForAge(group)) {
      if (seen.has(channel.name)) continue;
      seen.add(channel.name);
      out.push({ ...channel, isDefaultTrusted: true, source: "whitelist" });
    }
  }
  return out;
}

async function parentChannels() {
  const out = [];
  const custom = (await listCustomChannels()).filter((c) => c.status === "approved");
  custom.forEach((c) =>
    out.push({
      name: c.name,
      channelId: c.channelId || null,
      ageGroup: c.ageGroup,
      categories: c.categories?.length ? c.categories : [ENTERTAINMENT_CATEGORY],
      nativeLanguage: c.nativeLanguage || "en",
      isDefaultTrusted: false,
      source: "parent",
    })
  );
  for (const group of ALL_AGE_GROUPS) {
    for (const c of await confirmedChannelsForAge(group)) {
      if (out.some((x) => x.channelId === c.channelId)) continue;
      out.push({ ...c, ageGroup: group, isDefaultTrusted: false, source: "vetted" });
    }
  }
  return out;
}

async function allSources(profileAgeGroup) {
  const trusted = await defaultTrustedChannels();
  const extras = await parentChannels();
  const rank = (s) => (s.ageGroup === profileAgeGroup ? 0 : 1);
  return [...trusted, ...extras].sort((a, b) => rank(a) - rank(b));
}

async function resolveMissing(names) {
  const map = (await getCached(IDS_KEY)) ?? {};
  const missing = names.filter((n) => !map[n]);
  if (!missing.length) return map;
  for (let i = 0; i < missing.length; i += 10) {
    const resolved = await resolveChannels(missing.slice(i, i + 10));
    resolved.forEach((r) => {
      if (r.channelId) map[r.query] = r.channelId;
    });
  }
  await putCached(IDS_KEY, map);
  return map;
}

async function scanChannel(channel, channelId) {
  const uploads = await fetchChannelUploads(channelId, 10);
  const gated = applyWhitelistGates(uploads, channel.ageGroup);
  const now = new Date().toISOString();
  const categories = channel.categories?.length ? channel.categories : [ENTERTAINMENT_CATEGORY];
  if (gated.length) {
    await putLibraryVideos(
      gated.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        channelId: v.channelId,
        channelTitle: v.channelTitle || channel.name,
        category: categories[0],
        ageGroup: channel.ageGroup,
        language: (v.language || channel.nativeLanguage || "en").slice(0, 2).toLowerCase(),
        durationSeconds: v.durationSeconds,
        viewCount: v.viewCount,
        thumbnail: v.thumbnail,
        approved: true,
        addedAt: now,
        sourceChannelId: channelId,
      }))
    );
  }
  await putLibraryChannel({
    channelId,
    name: channel.name,
    ageGroup: channel.ageGroup,
    categories,
    language: channel.nativeLanguage || "en",
    isDefaultTrusted: !!channel.isDefaultTrusted,
    active: true,
    reviewedAt: now,
    source: channel.source || "registry",
  });
  return gated.length;
}

async function importBatch(batch) {
  let failureCode = null;
  let idMap = {};
  try {
    idMap = await resolveMissing(batch.map((c) => c.name));
  } catch (error) {
    if (error instanceof YoutubeApiError) failureCode = error.code;
  }
  let added = 0;
  const scanned = new Set((await getCached(SCANNED_KEY)) ?? []);
  for (const channel of batch) {
    const channelId = channel.channelId || idMap[channel.name];
    if (!channelId) continue;
    try {
      const n = await scanChannel(channel, channelId);
      added += n;
      if (n > 0) scanned.add(`${channel.name}:${channel.ageGroup || ""}`);
    } catch (error) {
      if (error instanceof YoutubeApiError && !failureCode) failureCode = error.code;
    }
  }
  await putCached(SCANNED_KEY, [...scanned]);
  return { added, failureCode };
}

let backgroundImport = null;

function continueImportInBackground(sources) {
  if (backgroundImport) return;
  backgroundImport = (async () => {
    for (;;) {
      const scanned = new Set((await getCached(SCANNED_KEY)) ?? []);
      const remaining = sources.filter((s) => !scanned.has(`${s.name}:${s.ageGroup || ""}`));
      if (!remaining.length) break;
      const { failureCode } = await importBatch(remaining.slice(0, IMPORT_BATCH));
      if (failureCode) break;
    }
  })()
    .catch(() => {})
    .finally(() => {
      backgroundImport = null;
    });
}

export async function ensureLibraryVideos(profile) {
  const existing = await libraryVideosForAge(profile.ageGroup);
  const sources = await allSources(profile.ageGroup);
  const sameAge = sources.filter((s) => s.ageGroup === profile.ageGroup);
  if (existing.length > 0) {
    continueImportInBackground(sameAge.length ? sameAge : sources);
    return { ok: true, added: 0 };
  }
  const scanned = new Set((await getCached(SCANNED_KEY)) ?? []);
  const pool = sameAge.length ? sameAge : sources;
  const unscanned = pool.filter((s) => !scanned.has(`${s.name}:${s.ageGroup || ""}`));
  const targets = (unscanned.length ? unscanned : pool).slice(0, IMPORT_BATCH);
  if (!targets.length) return { ok: true, added: 0 };
  const { added, failureCode } = await importBatch(targets);
  continueImportInBackground(pool);
  if (added === 0 && failureCode) return { ok: false, code: failureCode };
  return { ok: true, added };
}

export async function importApprovedDiscovery(ageGroup) {
  const approved = (await getCached(`approved:${ageGroup}`)) ?? [];
  if (!approved.length) return 0;
  const now = new Date().toISOString();
  await putLibraryVideos(
    approved.map((v) => ({
      ...v,
      ageGroup,
      language: (v.language || "en").slice(0, 2).toLowerCase(),
      approved: true,
      addedAt: v.addedAt ?? now,
      sourceChannelId: v.channelId ?? "",
    }))
  );
  return approved.length;
}

export async function getLibraryVideosForProfile(profile) {
  const [primary = "en", ...secondary] = profile.targetLanguages || [];
  const stored = (await libraryVideosForAge(profile.ageGroup)).filter((v) => v.approved !== false);
  return stored.map(({ approved, addedAt, sourceChannelId, ageGroup, ...video }) => {
    const language = (video.language || primary).slice(0, 2).toLowerCase();
    return secondary.includes(language) ? { ...video, category: ENTERTAINMENT_CATEGORY } : video;
  });
}

export async function refreshLibrary({ manual = false } = {}) {
  const meta = (await getCached(META_KEY)) ?? {};
  const now = Date.now();
  if (!manual && meta.lastRefreshAt && now - meta.lastRefreshAt < AUTO_REFRESH_MS) {
    return { skipped: true, added: 0, quotaIssue: false };
  }

  const resolved = (await listLibraryChannels())
    .filter((c) => c.active !== false)
    .map((c) => ({
      name: c.name,
      channelId: c.channelId,
      ageGroup: c.ageGroup,
      categories: c.categories,
      nativeLanguage: c.language,
      isDefaultTrusted: c.isDefaultTrusted,
      source: c.source,
    }));

  const knownIds = (await getCached(IDS_KEY)) ?? {};
  const heal = (await defaultTrustedChannels())
    .filter((c) => !resolved.some((r) => r.name === c.name) && !knownIds[c.name])
    .slice(0, HEAL_PER_REFRESH);

  const extras = (await parentChannels()).filter((c) => !resolved.some((r) => r.name === c.name));

  const rotating =
    resolved.length > 0
      ? Array.from({ length: Math.min(REFRESH_CHANNELS, resolved.length) }, (_, i) => {
          const offset = (Math.floor(now / 86400000) * REFRESH_CHANNELS + i) % resolved.length;
          return resolved[offset];
        })
      : [];

  const emptyAgeSources = [];
  const trusted = await defaultTrustedChannels();
  for (const group of ALL_AGE_GROUPS) {
    const have = await libraryVideosForAge(group);
    if (have.length > 0) continue;
    emptyAgeSources.push(...trusted.filter((s) => s.ageGroup === group).slice(0, IMPORT_BATCH));
  }

  const targets = [...emptyAgeSources, ...heal, ...extras, ...rotating].filter(
    (channel, index, all) => all.findIndex((c) => c.name === channel.name && c.ageGroup === channel.ageGroup) === index
  );

  let added = 0;
  let quotaIssue = false;
  for (const channel of targets) {
    try {
      const idMap = await resolveMissing([channel.name]);
      const channelId = channel.channelId || idMap[channel.name];
      if (!channelId) continue;
      added += await scanChannel(channel, channelId);
    } catch (error) {
      if (error instanceof YoutubeApiError) {
        if (error.code === "YOUTUBE_QUOTA_OR_KEY" || error.code === "MISSING_API_KEY") {
          quotaIssue = true;
          break;
        }
      }
    }
  }
  for (const group of ALL_AGE_GROUPS) await importApprovedDiscovery(group);

  await putCached(META_KEY, {
    ...meta,
    lastRefreshAt: now,
    lastRefreshStatus: quotaIssue ? "limited" : "ok",
    quotaOk: !quotaIssue,
    lastRefreshAdded: added,
  });
  return { added, quotaIssue };
}

export function maybeAutoRefresh() {
  refreshLibrary({ manual: false }).catch(() => {});
}

export async function libraryStats() {
  const [channels, videos, trusted, meta] = await Promise.all([
    listLibraryChannels(),
    listLibraryVideos(),
    defaultTrustedChannels(),
    getCached(META_KEY),
  ]);
  const tally = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
  const byCategory = new Map();
  const byAge = new Map();
  const byLanguage = new Map();
  videos.forEach((v) => {
    tally(byCategory, v.category);
    tally(byAge, v.ageGroup);
    tally(byLanguage, (v.language || "en").slice(0, 2));
  });
  return {
    trustedTotal: trusted.length,
    trustedResolved: channels.filter((c) => c.isDefaultTrusted).length,
    totalVideos: videos.length,
    byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
    byAge: [...byAge.entries()],
    byLanguage: [...byLanguage.entries()].sort((a, b) => b[1] - a[1]),
    lastRefreshAt: meta?.lastRefreshAt ?? null,
    lastRefreshStatus: meta?.lastRefreshStatus ?? null,
    quotaOk: meta?.quotaOk !== false,
  };
}
