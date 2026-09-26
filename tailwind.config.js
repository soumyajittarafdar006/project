/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a',
        cardBg: '#1e293b',
        accentBlue: '#38bdf8'
      }
    },
  },
  plugins: [],
}
