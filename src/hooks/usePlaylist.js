import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "wavelength:playlist";

function loadFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Corrupt JSON or storage unavailable (private mode, quota, etc.)
    return [];
  }
}

/**
 * Manages a persistent list of saved tracks in localStorage.
 * This is separate from the ephemeral search-result "queue" in App.jsx —
 * the playlist survives refreshes, the queue doesn't.
 */
export default function usePlaylist() {
  const [playlist, setPlaylist] = useState(loadFromStorage);

  // Any time the playlist changes, persist it. Runs after the initial
  // render too, which is a harmless no-op write if nothing changed yet.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist));
    } catch {
      // Storage full or unavailable — fail silently, playlist still
      // works for the current session via React state.
    }
  }, [playlist]);

  const isInPlaylist = useCallback(
    (id) => playlist.some((t) => t.id === id),
    [playlist]
  );

  const addToPlaylist = useCallback((track) => {
    setPlaylist((prev) =>
      prev.some((t) => t.id === track.id) ? prev : [...prev, track]
    );
  }, []);

  const removeFromPlaylist = useCallback((id) => {
    setPlaylist((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleInPlaylist = useCallback(
    (track) => {
      if (isInPlaylist(track.id)) {
        removeFromPlaylist(track.id);
      } else {
        addToPlaylist(track);
      }
    },
    [isInPlaylist, addToPlaylist, removeFromPlaylist]
  );

  const clearPlaylist = useCallback(() => setPlaylist([]), []);

  return {
    playlist,
    isInPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    toggleInPlaylist,
    clearPlaylist,
  };
}
