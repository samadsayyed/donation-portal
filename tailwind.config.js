/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        grey: "#0F172A", // dark navy grey used in the header/nav
        customBeige: "#0F172A", // vibrant cyan used in buttons and accents
        maroon: "#0f172a", // deep background used in hero section
        primary: "#0f172a", // primary teal-blue from buttons
        primaryHover: "#0F172A", // slightly darker hover for CTA buttons
        text: {
          primary: "#FFFFFF", // white text seen in the header and hero
          secondary: "#E2E8F0", // light greyish text for sub-descriptions
        },
      },
    },
  },
  plugins: [],
};
