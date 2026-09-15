const AGE_GROUPS = ["toddler_2_4", "early_learner_5_7", "tween_8_12"];
const fail = (res, error, code, status = 400) => res.status(status).json({ ok: false, error, code });

export default async function handler(req, res) {
  if (req.method !== "POST") return fail(res, "Method not allowed.", "INVALID_ACTION", 405);
  try {
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 200) : "";
    const description = typeof payload.description === "string" ? payload.description.slice(0, 1200) : "";
    const language = /^[a-z]{2}$/.test(payload.language || "") ? payload.language : "en";
    const ageGroup = AGE_GROUPS.includes(payload.ageGroup) ? payload.ageGroup : "early_learner_5_7";
    const duration = Number.isFinite(Number(payload.durationSeconds)) ? Math.min(Math.max(Number(payload.durationSeconds), 60), 3600) : 300;
    if (!title) return fail(res, "title is required.", "INVALID_INPUT");
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return fail(res, "Add OPENAI_API_KEY in Vercel env.", "MISSING_API_KEY", 503);
    const ageLabel = ageGroup === "toddler_2_4" ? "toddlers (2-4 years)" : ageGroup === "tween_8_12" ? "tweens (8-12 years)" : "early learners (5-7 years)";
    const prompt = `Create kid-safe learning JSON for this video.\nTitle: ${title}\nDescription: ${description || "(none)"}\nAudience: ${ageLabel}\nDuration: ${duration}s\nLanguage: ${language}\nReturn JSON with vocabulary (term, meaning), questions (text, options[3], correctIndex, atSeconds), endQuestion (text, options[3], correctIndex).`;
    const llm = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }], temperature: 0.4 }),
    });
    if (!llm.ok) return fail(res, "Generation failed.", "GENERATION_ERROR", 500);
    const completion = await llm.json();
    let result = {};
    try { result = JSON.parse(completion.choices?.[0]?.message?.content || "{}"); } catch { result = {}; }
    const asText = (value) => (typeof value === "string" ? value.trim().slice(0, 300) : "");
    const vocabulary = (Array.isArray(result.vocabulary) ? result.vocabulary : []).slice(0, 8).map((item) => ({ term: asText(item?.term), meaning: asText(item?.meaning) })).filter((item) => item.term && item.meaning);
    const cleanQuestion = (question, withTiming) => {
      if (!question || typeof question !== "object") return null;
      const text = asText(question.text);
      const options = (Array.isArray(question.options) ? question.options : []).slice(0, 3).map(asText).filter(Boolean);
      if (!text || options.length < 2) return null;
      const clean = { text, options, correctIndex: Math.min(Math.max(Number(question.correctIndex) || 0, 0), options.length - 1) };
      if (withTiming) clean.atSeconds = Math.min(Math.max(Math.round(Number(question.atSeconds) || duration * 0.4), 15), Math.max(duration - 15, 30));
      return clean;
    };
    const questions = (Array.isArray(result.questions) ? result.questions : []).slice(0, 3).map((q) => cleanQuestion(q, true)).filter(Boolean);
    return res.status(200).json({ ok: true, vocabulary, questions, endQuestion: cleanQuestion(result.endQuestion, false) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message || "Generation failed.", code: "GENERATION_ERROR" });
  }
}
