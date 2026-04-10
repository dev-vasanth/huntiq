/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07070f',
          900: '#0d0d1a',
          800: '#12121f',
          700: '#1a1a2e',
          600: '#242440',
          500: '#2e2e52',
        },
        brand: {
          orange: '#f97316',
          purple: '#a855f7',
          pink: '#ec4899',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #f97316, #a855f7)',
        'gradient-brand-r': 'linear-gradient(135deg, #a855f7, #f97316)',
        'gradient-card': 'linear-gradient(145deg, #12121f, #0d0d1a)',
      },
      boxShadow: {
        'glow-orange': '0 0 30px rgba(249,115,22,0.25)',
        'glow-purple': '0 0 30px rgba(168,85,247,0.25)',
        'glow-brand': '0 0 40px rgba(168,85,247,0.2), 0 0 80px rgba(249,115,22,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'gradient-shift': 'gradientShift 4s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168,85,247,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(249,115,22,0.4)' },
        },
      },
    },
  },
  plugins: [],
};
