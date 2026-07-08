import { useEffect } from "react";

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * Global playback shortcuts:
 *   Space / K   -> toggle play/pause
 *   ArrowRight / L -> next track
 *   ArrowLeft / J  -> previous track
 *
 * Shortcuts are ignored while the user is typing in the search box (or any
 * input/textarea/contentEditable), so this is safe to use with an on-screen
 * mobile keyboard as well as a physical one.
 */
export default function useKeyboardShortcuts({ onTogglePlay, onNext, onPrev }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping =
        TYPING_TAGS.has(target.tagName) || target.isContentEditable;
      if (isTyping) return;

      switch (event.key) {
        case " ":
        case "k":
        case "K":
          event.preventDefault(); // stop the page from scrolling on space
          onTogglePlay?.();
          break;
        case "ArrowRight":
        case "l":
        case "L":
          onNext?.();
          break;
        case "ArrowLeft":
        case "j":
        case "J":
          onPrev?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTogglePlay, onNext, onPrev]);
}
