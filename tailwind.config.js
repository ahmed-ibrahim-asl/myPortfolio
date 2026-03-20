/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        darkbg: "#0A0A0A",
        darknav: "rgba(10, 10, 10, 0.8)",
        darkcard: "#111827",
        accent: "#2563EB",
        accent2: "#3B82F6",
        textmain: "#FAFAFA",
        textmuted: "#94A3B8"
      },
      fontFamily: {
        'sans': ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
