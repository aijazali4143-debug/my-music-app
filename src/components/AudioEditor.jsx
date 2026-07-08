import React, { useState } from "react";
import useAudioEditor from "../hooks/useAudioEditor";

export default function AudioEditor() {
  const {
    fileName,
    duration,
    hasEdit,
    isPlaying,
    error,
    loadFile,
    deleteSegment,
    play,
    stopPlayback,
    downloadEdited,
    reset,
  } = useAudioEditor();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    setStart("");
    setEnd("");
  };

  const handleDelete = () => {
    const s = parseFloat(start);
    const e = parseFloat(end);
    if (Number.isNaN(s) || Number.isNaN(e)) return;
    deleteSegment(s, e);
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg text-white">Split &amp; Delete</h2>
        <p className="font-body text-xs text-mist mt-1">
          Trim a segment out of an audio file on your device — nothing is
          uploaded anywhere, it all happens locally in the browser.
        </p>
      </div>

      <label className="flex items-center justify-center gap-2 border border-dashed border-white/15 rounded-xl py-4 cursor-pointer hover:border-gold/40 transition-colors">
        <span className="font-body text-sm text-mist">
          {fileName ? fileName : "Choose an audio file…"}
        </span>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {error && (
        <p className="font-body text-xs text-red-300">{error}</p>
      )}

      {duration > 0 && (
        <>
          <p className="font-body text-xs text-mist">
            Duration: {duration.toFixed(2)}s
          </p>

          <div className="flex items-center gap-3">
            <TimeField label="Start (s)" value={start} onChange={setStart} />
            <TimeField label="End (s)" value={end} onChange={setEnd} />
            <button
              onClick={handleDelete}
              className="font-display text-sm text-ink bg-gold hover:bg-gold/90 transition-colors px-4 py-2 rounded-full self-end"
            >
              Cut
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => (isPlaying ? stopPlayback() : play())}
              className="font-body text-xs text-white bg-white/10 hover:bg-white/15 transition-colors px-3 py-1.5 rounded-full"
            >
              {isPlaying ? "Stop" : hasEdit ? "Preview edit" : "Preview"}
            </button>

            <button
              onClick={downloadEdited}
              disabled={!hasEdit}
              className="font-body text-xs text-ink bg-teal hover:bg-teal/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-full"
            >
              Download result (.wav)
            </button>

            <button
              onClick={reset}
              className="font-body text-xs text-mist hover:text-white transition-colors ml-auto"
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function TimeField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-body text-[11px] text-mist">{label}</label>
      <input
        type="number"
        step="0.1"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-gold/50"
      />
    </div>
  );
}
