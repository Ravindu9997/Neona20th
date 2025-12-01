/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Define custom fonts used in the BirthdayCard component
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        monoton: ['Monoton', 'cursive'],
        mono: ['IBM Plex Mono', 'monospace'],
        serif: ['Georgia', 'serif'], 
      },
    },
  },
  plugins: [],
}