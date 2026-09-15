// Per-video learning material (vocabulary + questions), generated once per video
// and cached locally forever — offline-friendly after the first watch.
import { base44 } from "@/api/base44Client";
import { getCached, putCached } from "@/adapters/localDb";

export async function getVideoLearning(video, profile) {
  const language = (profile.targetLanguages || ["en"])[0];
  // v2: regenerated learning content (age-appropriateness rules tightened for toddlers)
  const key = `learning:v2:${video.id}:${profile.ageGroup}:${language}`;

  const cached = await getCached(key);
  if (cached) return cached;

  try {
    const response = await base44.functions.invoke("videoLearning", {
      title: video.title,
      description: video.description,
      language,
      ageGroup: profile.ageGroup,
      durationSeconds: video.durationSeconds,
    });
    const data = response?.data;
    if (!data || data.ok !== true) return null;

    const learning = {
      vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary : [],
      questions: Array.isArray(data.questions) ? data.questions : [],
      endQuestion: data.endQuestion ?? null,
    };
    await putCached(key, learning);
    return learning;
  } catch {
    // Offline or generation failure — the learning extras simply don't show.
    return null;
  }
}