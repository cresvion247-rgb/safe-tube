import { getCached, putCached } from "@/adapters/localDb";

export async function getVideoLearning(video, profile) {
  const language = (profile.targetLanguages || ["en"])[0];
  const key = `learning:v2:${video.id}:${profile.ageGroup}:${language}`;

  const cached = await getCached(key);
  if (cached) return cached;

  try {
    const response = await fetch("/api/video-learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: video.title,
        description: video.description,
        language,
        ageGroup: profile.ageGroup,
        durationSeconds: video.durationSeconds,
      }),
    });
    const data = await response.json().catch(() => null);
    if (!data || data.ok !== true) return null;

    const learning = {
      vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary : [],
      questions: Array.isArray(data.questions) ? data.questions : [],
      endQuestion: data.endQuestion ?? null,
    };
    await putCached(key, learning);
    return learning;
  } catch {
    return null;
  }
}
