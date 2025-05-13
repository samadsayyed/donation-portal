/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        grey: "#10344c", // dark navy grey used in the header/nav
        customBeige: "#10344c", // vibrant cyan used in buttons and accents
        maroon: "#10344c", // deep background used in hero section
        primary: "#10344c", // primary teal-blue from buttons
        primaryHover: "#10344c", // slightly darker hover for CTA buttons
        text: {
          primary: "#FFFFFF", // white text seen in the header and hero
          secondary: "#E2E8F0", // light greyish text for sub-descriptions
        },
      },
    },
  },
  plugins: [],
};
