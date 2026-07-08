import React, { useState, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import VideoList from "./components/VideoList";
import Player from "./components/Player";
import Playlist from "./components/Playlist";
import AudioEditor from "./components/AudioEditor";
import useYouTubePlayer from "./hooks/useYouTubePlayer";
import usePlaylist from "./hooks/usePlaylist";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // index into `tracks` (search queue)
  const [playlistIndex, setPlaylistIndex] = useState(-1); // index into `playlist`
  const [playbackSource, setPlaybackSource] = useState(null); // "queue" | "playlist" | null
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    isReady,
    isPlaying,
    volume,
    currentVideoId,
    playVideoById,
    togglePlayPause,
    setVolume,
  } = useYouTubePlayer("youtube-player-target");

  const {
    playlist,
    isInPlaylist,
    toggleInPlaylist,
    removeFromPlaylist,
    clearPlaylist,
  } = usePlaylist();

  // --- Playing from the search queue (VideoList) ---
  const playQueueIndex = useCallback(
    (index) => {
      const track = tracks[index];
      if (!track) return;
      setCurrentIndex(index);
      setPlaybackSource("queue");
      playVideoById(track.id);
    },
    [tracks, playVideoById]
  );

  const handleSelectTrack = (videoId) => {
    const index = tracks.findIndex((t) => t.id === videoId);
    if (index !== -1) playQueueIndex(index);
  };

  // --- Playing from the saved Playlist ---
  const playPlaylistIndex = useCallback(
    (index) => {
      const track = playlist[index];
      if (!track) return;
      setPlaylistIndex(index);
      setPlaybackSource("playlist");
      playVideoById(track.id);
    },
    [playlist, playVideoById]
  );

  const handlePlaySavedTrack = (videoId) => {
    const index = playlist.findIndex((t) => t.id === videoId);
    if (index !== -1) playPlaylistIndex(index);
  };

  // --- Next / Prev follow whichever list the current track came from ---
  const handleNext = () => {
    if (playbackSource === "playlist") {
      if (!playlist.length) return;
      playPlaylistIndex((playlistIndex + 1) % playlist.length);
      return;
    }
    if (!tracks.length) return;
    playQueueIndex((currentIndex + 1) % tracks.length);
  };

  const handlePrev = () => {
    if (playbackSource === "playlist") {
      if (!playlist.length) return;
      playPlaylistIndex((playlistIndex - 1 + playlist.length) % playlist.length);
      return;
    }
    if (!tracks.length) return;
    playQueueIndex((currentIndex - 1 + tracks.length) % tracks.length);
  };

  const handleResults = (results) => {
    setTracks(results);
    setCurrentIndex(-1);
  };

  useKeyboardShortcuts({
    onTogglePlay: togglePlayPause,
    onNext: handleNext,
    onPrev: handlePrev,
  });

  const currentTrack =
    playbackSource === "playlist"
      ? playlist[playlistIndex] || null
      : playbackSource === "queue"
      ? tracks[currentIndex] || null
      : null;

  return (
    <div className="min-h-screen font-body">
      <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-white">
            Wavelength
          </h1>
          <p className="text-mist text-sm mt-1">
            A quiet corner to search, queue, and play tracks from YouTube.
          </p>
        </header>

        <SearchBar
          onResults={handleResults}
          onLoadingChange={setIsLoading}
          onError={setError}
        />

        <Player
          currentTrack={currentTrack}
          isReady={isReady}
          isPlaying={isPlaying}
          volume={volume}
          onTogglePlayPause={togglePlayPause}
          onNext={handleNext}
          onPrev={handlePrev}
          onVolumeChange={setVolume}
        />

        <VideoList
          tracks={tracks}
          isLoading={isLoading}
          error={error}
          currentVideoId={currentVideoId}
          isPlaying={isPlaying}
          onSelectTrack={handleSelectTrack}
          isInPlaylist={isInPlaylist}
          onToggleSave={toggleInPlaylist}
        />

        <Playlist
          playlist={playlist}
          currentVideoId={currentVideoId}
          isPlaying={isPlaying}
          onSelectTrack={handlePlaySavedTrack}
          onRemoveTrack={removeFromPlaylist}
          onClearPlaylist={clearPlaylist}
        />

        <AudioEditor />

        <p className="font-body text-[11px] text-mist/70 text-center">
          Shortcuts: Space/K play·pause · ←/J previous · →/L next
          {playbackSource === "playlist" && " · following your playlist"}
        </p>
      </div>
    </div>
  );
}
