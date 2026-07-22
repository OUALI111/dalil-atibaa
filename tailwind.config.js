/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: '#1A87D8',
            hover: '#156eb1',
          },
          dark: {
            DEFAULT: '#1E293B',
            hover: '#0F172A',
          }
        }
      }
    },
  },
  plugins: [],
}