/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0F1015',
          dark: '#16181F',
          gold: '#B98A3C',
          'gold-light': '#D4AF37',
          canvas: '#F8F9FA',
          surface: '#FFFFFF',
          border: '#E8ECEF',
          muted: '#6C757D',
        },
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.2em',
        futuristic: '.15em',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 8px 30px -4px rgba(0, 0, 0, 0.06)',
        'glow-subtle': '0 0 20px rgba(185, 138, 60, 0.15)',
        'floating': '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
