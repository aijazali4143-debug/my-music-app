import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Loads the YouTube IFrame Player API exactly once for the whole app and
 * resolves a shared promise when window.onYouTubeIframeAPIReady fires.
 * Multiple components can call this without double-injecting the script
 * or clobbering each other's ready callback.
 */
let apiReadyPromise = null;
function loadYouTubeIframeAPI() {
  if (apiReadyPromise) return apiReadyPromise;

  apiReadyPromise = new Promise((resolve) => {
    // If a previous mount already finished loading it, resolve immediately.
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    // YouTube's script calls this global function itself once it has
    // finished loading and initializing — this is the required hook per
    // the IFrame Player API docs.
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") previous();
      resolve(window.YT);
    };

    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  });

  return apiReadyPromise;
}

/**
 * Manages a single YouTube IFrame player instance mounted into `containerId`.
 * Returns imperative controls + a small slice of live state for the UI.
 */
export default function useYouTubePlayer(containerId) {
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(70);
  const [currentVideoId, setCurrentVideoId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeIframeAPI().then((YT) => {
      if (cancelled) return;

      playerRef.current = new YT.Player(containerId, {
        height: "270",
        width: "480",
        playerVars: {
          autoplay: 0,
          controls: 0, // custom controls live in <Player />
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            playerRef.current.setVolume(volume);
            setIsReady(true);
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === YT.PlayerState.PLAYING);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  const playVideoById = useCallback((videoId) => {
    if (!playerRef.current || !videoId) return;
    playerRef.current.loadVideoById(videoId);
    setCurrentVideoId(videoId);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const setVolume = useCallback((value) => {
    if (!playerRef.current) return;
    playerRef.current.setVolume(value);
    setVolumeState(value);
  }, []);

  return {
    isReady,
    isPlaying,
    volume,
    currentVideoId,
    playVideoById,
    togglePlayPause,
    setVolume,
  };
}
