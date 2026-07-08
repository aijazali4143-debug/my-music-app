import React from "react";

export default function Playlist({
  playlist,
  currentVideoId,
  isPlaying,
  onSelectTrack,
  onRemoveTrack,
  onClearPlaylist,
}) {
  return (
    <div className="glass-panel p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-white">My Playlist</h2>
        {playlist.length > 0 && (
          <button
            onClick={onClearPlaylist}
            className="font-body text-xs text-mist hover:text-red-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {playlist.length === 0 ? (
        <p className="font-body text-xs text-mist">
          Tap the star on any track to save it here — it'll still be here
          next time you open the app.
        </p>
      ) : (
        <ul className="divide-y divide-white/5 -mx-5">
          {playlist.map((track) => {
            const isCurrent = track.id === currentVideoId;
            return (
              <li
                key={track.id}
                className={`flex items-center gap-3 px-5 py-2.5 ${
                  isCurrent ? "bg-white/5" : ""
                }`}
              >
                <button
                  onClick={() => onSelectTrack(track.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
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
                  onClick={() => onRemoveTrack(track.id)}
                  aria-label="Remove from playlist"
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-mist hover:text-red-300 hover:bg-white/5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
