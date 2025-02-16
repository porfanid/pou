export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // Enable dark mode using the "class" strategy
  theme: {
    extend: {
      colors: {
        titleRed: "#d00000",
        titleIntermediate: "#df2b07",
        titleStart: "#e75217",
        titleOrange: "#e70000",
        background: "#000000", // Black for the site's background
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
      animation: {
        'gradient-animation': 'gradient 6s ease infinite', // Define the animation
        bounceOnce: 'bounceOnce 3s ease-in forwards', // 1s duration, runs once
        bounceTwice: 'bounceOnce 3s infinite',
        flame: "flame 0.5s infinite alternate",
      },
      keyframes: {
        flame: {
          "0%": { textShadow: "0 0 5px rgba(255, 69, 0, 0.75), 0 0 10px rgba(255, 69, 0, 0.75)" },
          "50%": { textShadow: "0 0 5px rgba(255, 140, 0, 0.75), 0 0 10px rgba(255, 140, 0, 0.75)" },
          "100%": { textShadow: "0 0 5px rgba(255, 0, 0, 0.75), 0 0 10px rgba(255, 0, 0, 0.75)" },
        },
        bounceTwice: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceOnce: {
          '0%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-10px)' },
          '50%': { transform: 'translateY(0)' },
          '75%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' },
        },
        gradient: {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
          '100%': {
            backgroundPosition: '0% 50%',
          },
        },
      },
    },
  },
  plugins: [],
};