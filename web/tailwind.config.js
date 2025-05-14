/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",      // all pages/layouts
    "./src/components/**/*.{js,ts,jsx,tsx}" // reusable UI components
  ],
  theme: {
    extend: {
      colors: {
        brand: {                     // if you still want your custom colors
          green: "#047857",
          yellow: "#facc15",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
  ],
};
