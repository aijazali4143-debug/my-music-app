/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0E1A",       // near-black navy base
        panel: "#12162A",     // glass panel base (used with opacity)
        gold: "#E8B04B",      // vinyl-label amber — primary accent
        teal: "#3FA796",      // "now playing" accent
        mist: "#8A8FA6",      // muted secondary text
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
