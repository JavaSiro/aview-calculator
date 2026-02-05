/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          aviewSlate: '#1a1d21',
          aviewEmerald: '#00bfa5',
        },
      },
    },
    plugins: [],
  }