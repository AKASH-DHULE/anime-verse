/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
      extend: {
        keyframes: {
          shake: {
            '0%, 100%': { transform: 'translateX(0)' },
            '25%': { transform: 'translateX(-5px)' },
            '50%': { transform: 'translateX(5px)' },
            '75%': { transform: 'translateX(-5px)' },
          },
        },
        animation: {
          shake: 'shake 0.4s ease-in-out',
        },
        colors: {
          accent: {
            DEFAULT: '#ff2d7a',
            700: '#ff1661'
          }
        },
        fontFamily: {
          display: ['Montserrat', 'sans-serif']
        }
      }
  },
  plugins: []
}
