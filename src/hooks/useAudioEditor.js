import { useState, useRef, useCallback, useEffect } from "react";
import audioBufferToWav from "../utils/audioBufferToWav";

/**
 * Loads a local audio file into an AudioBuffer, lets you cut a [start, end]
 * segment out of it, preview the result, and export it as a downloadable
 * WAV file. Intended for audio the user already has the rights to (their
 * own recordings/uploads) — this operates entirely on a File the user picks
 * from their device, not on anything pulled from YouTube.
 */
export default function useAudioEditor() {
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);

  const [originalBuffer, setOriginalBuffer] = useState(null);
  const [editedBuffer, setEditedBuffer] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  }, []);

  const loadFile = useCallback(
    async (file) => {
      setError(null);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const ctx = getContext();
        // decodeAudioData wants its own copy; slice(0) avoids detaching
        // a buffer something else might still reference.
        const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
        setOriginalBuffer(decoded);
        setEditedBuffer(null);
        setFileName(file.name);
      } catch (err) {
        setError("Couldn't decode that file — try a standard MP3/WAV/M4A.");
      }
    },
    [getContext]
  );

  /**
   * Removes the audio between startSec and endSec by copying every sample
   * before the cut and every sample after it into a new, shorter buffer.
   * AudioBuffer is immutable-by-design (no splice/delete method), so this
   * "copy the parts you want to keep" approach is the standard technique.
   */
  const deleteSegment = useCallback(
    (startSec, endSec) => {
      const source = originalBuffer;
      if (!source) return;

      const ctx = getContext();
      const sampleRate = source.sampleRate;
      const start = Math.max(0, Math.min(startSec, endSec));
      const end = Math.min(source.duration, Math.max(startSec, endSec));

      if (end <= start) {
        setError("End time must be after start time.");
        return;
      }

      const startFrame = Math.floor(start * sampleRate);
      const endFrame = Math.floor(end * sampleRate);
      const removedFrames = endFrame - startFrame;
      const newLength = source.length - removedFrames;

      if (newLength <= 0) {
        setError("That segment covers the whole track.");
        return;
      }

      const result = ctx.createBuffer(
        source.numberOfChannels,
        newLength,
        sampleRate
      );

      for (let ch = 0; ch < source.numberOfChannels; ch++) {
        const sourceData = source.getChannelData(ch);
        const resultData = result.getChannelData(ch);

        // Part before the cut
        resultData.set(sourceData.subarray(0, startFrame), 0);
        // Part after the cut, shifted left to close the gap
        resultData.set(sourceData.subarray(endFrame), startFrame);
      }

      setEditedBuffer(result);
      setError(null);
    },
    [originalBuffer, getContext]
  );

  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.onended = null;
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(
    (buffer) => {
      const bufferToPlay = buffer || editedBuffer || originalBuffer;
      if (!bufferToPlay) return;

      const ctx = getContext();
      stopPlayback();

      const node = ctx.createBufferSource();
      node.buffer = bufferToPlay;
      node.connect(ctx.destination);
      node.onended = () => setIsPlaying(false);
      node.start();

      sourceNodeRef.current = node;
      setIsPlaying(true);
    },
    [editedBuffer, originalBuffer, getContext, stopPlayback]
  );

  const downloadEdited = useCallback(() => {
    if (!editedBuffer) return;
    const blob = audioBufferToWav(editedBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = fileName ? fileName.replace(/\.[^/.]+$/, "") : "edited-audio";
    a.href = url;
    a.download = `${base}-edited.wav`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [editedBuffer, fileName]);

  const reset = useCallback(() => {
    stopPlayback();
    setOriginalBuffer(null);
    setEditedBuffer(null);
    setFileName(null);
    setError(null);
  }, [stopPlayback]);

  // Clean up the AudioContext when the component using this hook unmounts.
  useEffect(() => {
    return () => {
      stopPlayback();
      audioContextRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    fileName,
    duration: originalBuffer?.duration ?? 0,
    hasEdit: !!editedBuffer,
    isPlaying,
    error,
    loadFile,
    deleteSegment,
    play,
    stopPlayback,
    downloadEdited,
    reset,
  };
}
