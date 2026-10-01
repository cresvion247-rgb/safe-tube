const FLAGS = ["scary", "fight", "prank", "scream", "weapon", "blood", "hate", "stupid", "mean"];

export function slipNote(video, ageGroup) {
  const title = `${video?.title || ""} ${video?.description || ""}`.toLowerCase();
  if (!FLAGS.some((word) => title.includes(word))) return "";
  if (ageGroup === "toddler_2_4") return "This is only a story. We are kind and we stay safe.";
  if (ageGroup === "early_learner_5_7") return "If something feels unkind, it is not the lesson. Kindness is.";
  return "A clip can slip through. It does not change what is right: be kind, stay safe, and tell a parent if it felt wrong.";
}

export default function SlipNote({ video, ageGroup }) {
  const note = slipNote(video, ageGroup);
  if (!note) return null;
  return <p className="rounded-2xl bg-accent px-4 py-3 text-sm text-foreground">{note}</p>;
}
