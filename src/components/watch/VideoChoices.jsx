export default function VideoChoices({ videos, onChoose, label }) {
  if (!videos?.length) return <p className="text-sm text-muted-foreground">Videos will appear here.</p>;
  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-semibold text-muted-foreground">{label}</p> : null}
      <ul className="space-y-2">
        {videos.map((video) => (
          <li key={video.id}>
            <button type="button" onClick={() => onChoose(video)} className="flex w-full gap-3 rounded-xl bg-accent p-2 text-left hover:bg-accent/80">
              <img src={video.thumbnail || ""} alt="" className="h-20 w-36 shrink-0 rounded-lg bg-muted object-cover" />
              <span className="line-clamp-3 text-sm font-medium">{video.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
