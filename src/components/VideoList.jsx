import React from "react";

export default function VideoList({
  tracks,
  isLoading,
  error,
  currentVideoId,
  isPlaying,
  onSelectTrack,
  isInPlaylist,
  onToggleSave,
}) {
  if (error) {
    return (
      <div className="glass-panel p-6 text-sm text-red-300 font-body">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-panel p-6 text-sm text-mist font-body animate-pulse">
        Searching…
      </div>
    );
  }

  if (!tracks.length) {
    return (
      <div className="glass-panel p-6 text-sm text-mist font-body">
        Search for something to start building your queue.
      </div>
    );
  }

  return (
    <ul className="glass-panel divide-y divide-white/5 overflow-hidden">
      {tracks.map((track) => {
        const isCurrent = track.id === currentVideoId;
        const saved = isInPlaylist?.(track.id);
        return (
          <li
            key={track.id}
            className={`flex items-center transition-colors ${
              isCurrent ? "bg-white/5" : "hover:bg-white/5"
            }`}
          >
            <button
              onClick={() => onSelectTrack(track.id)}
              className="flex-1 min-w-0 flex items-center gap-4 px-4 py-3 text-left"
            >
              <img
                src={track.thumbnail}
                alt={track.title}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`font-display text-sm truncate ${
                    isCurrent ? "text-gold" : "text-white"
                  }`}
                >
                  {track.title}
                </p>
                <p className="font-body text-xs text-mist truncate">
                  {track.channel}
                </p>
              </div>
              {isCurrent && isPlaying && (
                <span className="eq-bars shrink-0" aria-label="Now playing">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              )}
            </button>
            <button
              onClick={() => onToggleSave?.(track)}
              aria-label={saved ? "Remove from playlist" : "Save to playlist"}
              className={`shrink-0 w-9 h-9 mr-2 flex items-center justify-center rounded-full transition-colors ${
                saved ? "text-gold" : "text-mist hover:text-gold"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={saved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
