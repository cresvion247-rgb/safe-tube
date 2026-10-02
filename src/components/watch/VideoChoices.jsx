export default function VideoChoices({ videos, onChoose, label }) {
  if (!videos?.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <ul className="space-y-2">
        {videos.map((video) => (
          <li key={video.id}>
            <button type="button" onClick={() => onChoose(video)} className="flex w-full gap-2 rounded-xl bg-accent p-2 text-left hover:bg-accent/80">
              <img src={video.thumbnail || ""} alt="" className="h-16 w-28 shrink-0 rounded-lg bg-muted object-cover" />
              <span className="line-clamp-3 text-sm font-medium">{video.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
