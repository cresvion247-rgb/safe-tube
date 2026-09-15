// Generates per-video learning material for kids: vocabulary/concepts, mid-video
// pop-up questions, and an end-of-video question. Bounded, validated input; the
// AI output is sanitized before returning. No secrets or app data involved.
import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

const AGE_GROUPS = ["toddler_2_4", "early_learner_5_7", "tween_8_12"];

const fail = (error, code, status = 400) => Response.json({ ok: false, error, code }, { status });

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    vocabulary: {
      type: "array",
      items: {
        type: "object",
        properties: { term: { type: "string" }, meaning: { type: "string" } },
        required: ["term", "meaning"],
      },
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
          correctIndex: { type: "integer", minimum: 0, maximum: 2 },
          atSeconds: { type: "integer", minimum: 15 },
        },
        required: ["text", "options", "correctIndex", "atSeconds"],
      },
    },
    endQuestion: {
      type: "object",
      properties: {
        text: { type: "string" },
        options: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
        correctIndex: { type: "integer", minimum: 0, maximum: 2 },
      },
      required: ["text", "options", "correctIndex"],
    },
  },
  required: ["vocabulary", "questions", "endQuestion"],
};

export default async function (req) {
  try {
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") return fail("Invalid request body.", "INVALID_INPUT");

    const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 200) : "";
    const description = typeof payload.description === "string" ? payload.description.slice(0, 1200) : "";
    const language =
      typeof payload.language === "string" && /^[a-z]{2}$/.test(payload.language) ? payload.language : "en";
    const ageGroup = AGE_GROUPS.includes(payload.ageGroup) ? payload.ageGroup : "early_learner_5_7";
    const durationRaw = Number(payload.durationSeconds);
    const duration = Number.isFinite(durationRaw) ? Math.min(Math.max(durationRaw, 60), 3600) : 300;
    if (!title) return fail("title is required.", "INVALID_INPUT");

    const ageLabel =
      ageGroup === "toddler_2_4"
        ? "toddlers (2-4 years)"
        : ageGroup === "tween_8_12"
          ? "tweens (8-12 years)"
          : "early learners (5-7 years)";

    const base44 = createClientFromRequest(req);
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You create learning material for children, based on educational videos.
Video title: ${title}
Video description: ${description || "(no description available)"}
Audience: ${ageLabel}
Video duration: ${duration} seconds.
IMPORTANT: every piece of text you produce (terms, meanings, questions, answer options) must be written entirely in this language (ISO 639-1 code): ${language}.

AGE-APPROPRIATENESS IS THE MOST IMPORTANT RULE. The material must fit the audience's developmental level:
- toddlers (2-4 years): use only words and ideas a 3-year-old already knows. Vocabulary: 2-4 very simple everyday words (e.g. "big", "water", "jump"), each with a single short, warm sentence as "meaning". Questions must be about something concrete the child can see or already knows — colors, animals, sounds, big/small, counting to three, feelings. If the video's topic is too complex for this age, do NOT test that concept at all: pick one tiny, playful idea from the video (or from everyday life) instead. Every answer option must be a single short, familiar word, and the question must be playful so a guess is fun even without knowing.
- early learners (5-7 years): short simple sentences, concrete everyday facts, no technical or academic words.
- tweens (8-12 years): plain language; real terms only if a typical 8-12-year-old would know them.

Create:
1. vocabulary: 4-6 interesting words or concepts a child can learn from this video. Each has "term" and "meaning" — a single short, warm, kid-friendly sentence.
2. questions: 2 playful multiple-choice questions that spark curiosity about the video's topic. Each has "text", exactly 3 short "options", "correctIndex" (0-based index of the correct option), and "atSeconds" — the moment to show it, spread between 25% and 75% of the ${duration}-second duration.
3. endQuestion: 1 final multiple-choice question about the video, same shape as the questions but without atSeconds.

Keep everything gentle, positive, and easy to read for the age group. Never mention anything scary or unsafe.`,
      response_json_schema: RESPONSE_SCHEMA,
    });

    const asText = (value) => (typeof value === "string" ? value.trim().slice(0, 300) : "");
    const vocabulary = (Array.isArray(result?.vocabulary) ? result.vocabulary : [])
      .slice(0, 8)
      .map((item) => ({ term: asText(item?.term), meaning: asText(item?.meaning) }))
      .filter((item) => item.term && item.meaning);

    const cleanQuestion = (question, withTiming) => {
      if (!question || typeof question !== "object") return null;
      const text = asText(question.text);
      const options = (Array.isArray(question.options) ? question.options : [])
        .slice(0, 3)
        .map(asText)
        .filter(Boolean);
      if (!text || options.length < 2) return null;
      const correctIndex = Math.min(Math.max(Number(question.correctIndex) || 0, 0), options.length - 1);
      const clean = { text, options, correctIndex };
      if (withTiming) {
        const at = Number(question.atSeconds);
        const fallback = Math.round(duration * 0.4);
        clean.atSeconds = Math.min(Math.max(Math.round(Number.isFinite(at) ? at : fallback), 15), Math.max(duration - 15, 30));
      }
      return clean;
    };

    const questions = (Array.isArray(result?.questions) ? result.questions : [])
      .slice(0, 3)
      .map((q) => cleanQuestion(q, true))
      .filter(Boolean);
    const endQuestion = cleanQuestion(result?.endQuestion, false);

    return Response.json({ ok: true, vocabulary, questions, endQuestion });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "Generation failed.", code: "GENERATION_ERROR" },
      { status: 500 }
    );
  }
}