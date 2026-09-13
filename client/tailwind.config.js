/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        rpg: {
          dark: '#0d1117',
          panel: '#161b22',
          border: '#30363d',
          accent: '#8957e5',
          gold: '#f1e05a',
          xp: '#a371f7',
          health: '#f85149',
          mana: '#58a6ff',
          stamina: '#3fb950',
          parchment: '#fef3c7',
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0, 0, 0, 0.7)',
        'pixel-sm': '2px 2px 0px 0px rgba(0, 0, 0, 0.7)',
        'glow-gold': '0 0 15px rgba(241, 224, 90, 0.4)',
        'glow-xp': '0 0 15px rgba(163, 113, 247, 0.4)',
        'glow-level': '0 0 25px rgba(251, 191, 36, 0.7)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.18s ease-out',
        slideUp: 'slideUp 0.22s ease-out',
        slideDown: 'slideDown 0.22s ease-out',
      },
    },
  },
  plugins: [],
}
