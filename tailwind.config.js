/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}"
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
      backgroundImage: {
        'silk-gradient': "linear-gradient(135deg, #8a1c26 0%, #D72638 100%)",
        'glass-shine': "linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)",
      }
    },
  },
  plugins: [],
}

