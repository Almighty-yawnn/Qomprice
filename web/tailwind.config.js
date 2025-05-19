// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
        brand: {
          green: "#047857",
          yellow: "#facc15",
        },
      },
      fontFamily: {
        sans: ['var(--font-sora)', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        'gradient-flow': { // For the moving gradient effect
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'loader-fill': { // For the loader bar filling up
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        }
      },
      animation: {
        'gradient-flow': 'gradient-flow 4s ease infinite', // Gradient flows over 4s
        'loader-fill': 'loader-fill 1.5s ease-out forwards', // Bar fills in 1.5s
      },
      backgroundSize: { // Necessary for backgroundPosition animation to be visible
        '300%': '300% 300%', // A larger background size that can be moved
      },
      fontFamily: {
        sans: ['var(--font-sora)', ...defaultTheme.fontFamily.sans],
      },
         keyframes: {
        'gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'gradient-flow': 'gradient-flow 4s ease infinite', // Speed: 4 seconds per cycle
      },
      backgroundSize: { // Ensures we have a utility for larger background
        '200%': '200% auto', // Example, for horizontal flow
        '300%': '300% auto', // Another option
        // Or using arbitrary values directly like bg-[length:200%_auto]
      }
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
    require('@tailwindcss/typography'),
    require('@tailwindcss/typography'),
  ],
}
}