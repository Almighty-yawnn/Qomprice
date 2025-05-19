// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // If you have a pages directory
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#047857",
          yellow: "#facc15",
        },
      }, // <<--- COMMA IS ESSENTIAL HERE, if 'fontFamily' follows

      fontFamily: {
        sans: ['var(--font-sora)', ...defaultTheme.fontFamily.sans],
      }, // <<--- COMMA IS ESSENTIAL HERE, if 'keyframes' follows

      keyframes: {
        'gradient-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'loader-fill': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        }
      }, // <<--- COMMA IS ESSENTIAL HERE, if 'animation' follows

      animation: {
        'gradient-flow': 'gradient-flow 4s ease infinite',
        'loader-fill': 'loader-fill 1.5s ease-out forwards',
      }, // <<--- COMMA IS ESSENTIAL HERE, if 'backgroundSize' follows

      backgroundSize: {
        '200%': '200% auto',
        '300%': '300% auto', // Or '300% 300%' if you used that previously
      } // <<--- No comma needed HERE if it's the *last* property in 'extend'
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
    require('@tailwindcss/typography'),
  ],
};