/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#365aa1',
        background: '#f5f7fa',
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px) translateX(-50%)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) translateX(-50%)'
          },
        },
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out'
      }
    },
  },
  plugins: [],
}


