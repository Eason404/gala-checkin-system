/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"SF Pro Display"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        serif: ['"STKaiti"', '"KaiTi"', '"Source Han Serif CN"', 'serif'],
      },
      colors: {
        cny: {
          red: '#D72638',
          gold: '#FCE7BB',
          dark: '#8a1c26',
          bg: '#0F0F0F',
          accent: '#FCE7BB',
          cloud: '#F9F1E7'
        }
      },
      keyframes: {
        swing: {
          '0%': { transform: 'rotate(5deg)' },
          '100%': { transform: 'rotate(-5deg)' },
        },
        slide: {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
          '100%': { transform: 'translateX(200%) skewX(-15deg)' },
        },
        stamp: {
          '0%': { transform: 'scale(3) rotate(-15deg)', opacity: '0' },
          '40%': { transform: 'scale(0.8) rotate(5deg)', opacity: '1' },
          '70%': { transform: 'scale(1.1) rotate(-2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'cloud-flow': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-unfurl': {
          '0%': { width: '0%', opacity: '0.5' },
          '100%': { width: '100%', opacity: '1' },
        },
        'lantern-sway': {
          '0%': { transform: 'rotate(-3deg) translateY(0)' },
          '100%': { transform: 'rotate(3deg) translateY(10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        }
      },
      animation: {
        swing: 'swing 2s ease-in-out infinite alternate',
        slide: 'slide 1.5s ease-in-out infinite alternate',
        stamp: 'stamp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'cloud-flow': 'cloud-flow 40s linear infinite',
        'scroll-unfurl': 'scroll-unfurl 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'lantern-sway-slow': 'lantern-sway 4s ease-in-out infinite alternate',
        'lantern-sway-fast': 'lantern-sway 3s ease-in-out infinite alternate-reverse',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      backgroundImage: {
        'silk-gradient': "linear-gradient(135deg, #8a1c26 0%, #D72638 100%)",
        'glass-shine': "linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)",
      }
    },
    plugins: [],
  }
}
