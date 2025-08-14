// tailwind.config.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
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
        'gradient-flow': { // For the moving gradient effect
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'loader-fill': { // For the loader bar filling up
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        }
      }, // <<--- COMMA IS ESSENTIAL HERE, if 'animation' follows

      animation: {
        'gradient-flow': 'gradient-flow 4s ease infinite', // Gradient flows over 4s
        'loader-fill': 'loader-fill 1.5s ease-out forwards',
        'gradient-and-fill': 'gradient-flow 4s ease infinite, loader-fill 1.5s ease-out forwards',
      }, // <<--- COMMA IS ESSENTIAL HERE, if 'backgroundSize' follows

      backgroundSize: {
        '200%': '200% auto',
        '300%': '300% auto', // Or '300% 300%' if you used that previously
      } // <<--- No comma needed HERE if it's the *last* property in 'extend'
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@tailwindcss/aspect-ratio"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@tailwindcss/line-clamp"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/typography'),
  ],
};