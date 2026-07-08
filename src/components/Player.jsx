import React from "react";

export default function Player({
  currentTrack,
  isReady,
  isPlaying,
  volume,
  onTogglePlayPause,
  onNext,
  onPrev,
  onVolumeChange,
}) {
  return (
    <div className="glass-panel p-4 flex flex-col gap-4">
      {/*
        The IFrame Player API takes over this element and replaces it with
        an <iframe>, so it must exist in the DOM before YT.Player() runs.
        min sized to the required 480x270, and scales down responsively
        on narrow screens via aspect-ratio + max-width.
      */}
      <div className="w-full flex justify-center">
        <div
          className="w-full max-w-[480px] aspect-video rounded-xl overflow-hidden bg-black/40"
          style={{ minWidth: "240px" }}
        >
          <div id="youtube-player-target" className="w-full h-full" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm text-white truncate">
            {currentTrack ? currentTrack.title : "Nothing queued yet"}
          </p>
          <p className="font-body text-xs text-mist truncate">
            {currentTrack ? currentTrack.channel : "Pick a track from the list"}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <TransportButton label="Previous" onClick={onPrev} disabled={!isReady}>
            <path d="M6 6h2v12H6zM20 6l-8.5 6L20 18V6z" />
          </TransportButton>

          <TransportButton
            label={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlayPause}
            disabled={!isReady || !currentTrack}
            primary
          >
            {isPlaying ? (
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            ) : (
              <path d="M7 5l12 7-12 7V5z" />
            )}
          </TransportButton>

          <TransportButton label="Next" onClick={onNext} disabled={!isReady}>
            <path d="M18 6h-2v12h2zM4 6l8.5 6L4 18V6z" />
          </TransportButton>
        </div>

        <div className="hidden sm:flex items-center gap-2 w-28 shrink-0">
          <svg className="w-4 h-4 text-mist" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 9v6h4l5 5V4L9 9H5z" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full accent-gold"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

function TransportButton({ label, onClick, disabled, primary, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        primary
          ? "w-10 h-10 bg-gold text-ink hover:bg-gold/90"
          : "w-8 h-8 text-white hover:bg-white/10"
      }`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        {children}
      </svg>
    </button>
  );
}
