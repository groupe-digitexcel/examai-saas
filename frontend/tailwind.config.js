/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edfcf9',
          100: '#d2f7f1',
          200: '#a9ede3',
          300: '#71ddd1',
          400: '#38c4b8',
          500: '#1ea99e',
          600: '#178882',
          700: '#186d69',
          800: '#1a5755',
          900: '#1a4947',
          950: '#092e2c',
        },
        dark: {
          900: '#050d0c',
          800: '#0a1a18',
          700: '#0f2724',
          600: '#163530',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px #1ea99e33' },
          to:   { boxShadow: '0 0 30px #1ea99e88' },
        },
      },
    },
  },
  plugins: [],
};
