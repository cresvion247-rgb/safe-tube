import { resetPreferences } from "@/app/preferences";

export default function ResetPreferencesButton({ profileId }) {
  if (!profileId) return null;
  return (
    <button
      type="button"
      onClick={() => resetPreferences(profileId)}
      className="h-12 rounded-xl border border-border px-4 text-sm font-semibold"
    >
      Reset learned preferences
    </button>
  );
}
