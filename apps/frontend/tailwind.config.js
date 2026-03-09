/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pokemon-red': '#CC0000',
        'pokemon-red-dark': '#990000',
        'pokemon-yellow': '#FFDE00',
        'pokemon-yellow-dark': '#C8A800',
        'pokemon-blue': '#3B5BA7',
        'pokemon-blue-dark': '#2a4080',
        'pokemon-green': '#4CAF50',
        'pokemon-green-dark': '#388E3C',
        'pokemon-dark': '#1a1a2e',
        'pokemon-darker': '#0f0f1a',
        'pokemon-purple': '#6A0DAD',
        'pokemon-purple-dark': '#4a0080',
        'pokemon-light': '#f8f8f8',
        'pokemon-gray': '#2a2a3e',
        'pokemon-gray-light': '#3a3a5e',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'bounce-pixel': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0px)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 4px #FFDE00' },
          '50%': { boxShadow: '0 0 12px #FFDE00, 0 0 20px #FFDE00' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        'blink-slow': 'blink 1.5s step-end infinite',
        'bounce-pixel': 'bounce-pixel 0.8s steps(2) infinite',
        'slide-in': 'slide-in 0.2s steps(4) forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      boxShadow: {
        'pixel': '4px 4px 0px #000000',
        'pixel-sm': '2px 2px 0px #000000',
        'pixel-yellow': '4px 4px 0px #C8A800',
        'pixel-red': '4px 4px 0px #990000',
        'pixel-blue': '4px 4px 0px #2a4080',
        'pixel-inset': 'inset 2px 2px 0px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
