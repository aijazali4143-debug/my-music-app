import React, { useState } from "react";

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export default function SearchBar({ onResults, onLoadingChange, onError }) {
  const [query, setQuery] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!API_KEY) {
      onError(
        "No YouTube API key found. Add REACT_APP_YOUTUBE_API_KEY to your .env file and restart the dev server."
      );
      return;
    }

    onLoadingChange(true);
    onError(null);

    try {
      const params = new URLSearchParams({
        part: "snippet",
        type: "video",
        videoCategoryId: "10", // Music
        maxResults: "12",
        q: query,
        key: API_KEY,
      });

      const res = await fetch(`${SEARCH_URL}?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "YouTube search failed");
      }

      const tracks = (data.items || []).map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url,
      }));

      onResults(tracks);
    } catch (err) {
      onError(err.message);
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="glass-panel flex items-center gap-3 px-4 py-3">
        <svg
          className="w-5 h-5 text-mist shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.35 4.35a7.5 7.5 0 0012.3 12.3z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a track, artist, or album…"
          className="flex-1 bg-transparent text-white placeholder-mist/70 font-body text-sm outline-none"
        />
        <button
          type="submit"
          className="font-display text-sm font-medium text-ink bg-gold hover:bg-gold/90 transition-colors px-4 py-1.5 rounded-full"
        >
          Search
        </button>
      </div>
    </form>
  );
}
