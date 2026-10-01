import { getVideoLearning } from "@/app/learning";
import { recordPreference } from "@/app/preferences";

export function noteWatchChoice(profileId, video, choice) {
  if (profileId && video) recordPreference(profileId, video, choice);
}
