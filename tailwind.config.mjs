export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // Enable dark mode using the "class" strategy
  theme: {
    extend: {
      colors: {
        background: "#1c1c1c", // Almost black for the site's background
        card: "#1a1a1a", // Slightly lighter dark gray for cards
        text: {
          DEFAULT: "#c3c3c3", // Light metallic gray for text
          muted: "#c3c3c3", // Muted gray for less prominent text
          bold: "#af0000", // Silver-like color for bold text
          title: "#ffffff", // White for titles
        },
        primary: {
          DEFAULT: "#8b0000", // Deep crimson for primary accents
          hover: "#a60000", // Slightly lighter crimson for hover effects
        },
        border: "#5e5e5e", // Dark metallic gray for borders
      },
      fontFamily: {
        logo: [
          '"Oswald"', // Bold and stylish sans-serif for logos
          '"Noto Sans"', // Backed by multilingual support
          "sans-serif",
        ],
        body: [
          'var(--font-body)', // Use the CSS variable here
          '"Noto Serif"', // Fallback
          "serif",
        ],
      },
      fontWeight: {
        light: 300, // Light weight for subtitles or soft text
        normal: 400, // Default weight
        bold: 700, // Bold weight for emphasis
        greek: 400, // Adjust Greek text to match English
      },
    },
  },
  plugins: [],
};
