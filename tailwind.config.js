/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10344c",  // Dark blue
        secondary: "#08e4dc", // Cyan
        primaryHover:"#1a4663",
        secondaryDark: "#058f89", // Cyan

      },
    },
  },
  plugins: [],
}