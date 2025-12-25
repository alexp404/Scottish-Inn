/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffdf0',
          100: '#fffadc',
          200: '#fff4b8',
          300: '#ffec85',
          400: '#ffd700',
          500: '#f4c430',
          600: '#daa520',
          700: '#b8860b',
          800: '#9a7209',
          900: '#7d5e08',
        },
        babyblue: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#87ceeb',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Keep amber for backwards compatibility
        amber: {
          50: '#fffdf0',
          100: '#fffadc',
          200: '#fff4b8',
          300: '#ffec85',
          400: '#ffd700',
          500: '#f4c430',
          600: '#daa520',
          700: '#b8860b',
          800: '#9a7209',
          900: '#7d5e08',
        },
        // Keep orange mapped to baby blue
        orange: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#87ceeb',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}