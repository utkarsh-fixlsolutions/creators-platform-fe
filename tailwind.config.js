/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8F6F2",
        card: "#FFFFFF",
        primary: "#111111",
        secondary: "#6E6E6E",
        "border-whisper": "#E8E5E0",
        "accent-subtle": "#F0EDE6",
        "accent-brand": "#4F46E5",
        "accent-monetize": "#FF3B6B",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        editorial: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        script: ['"Caveat"', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.05)',
        'luxury-hover': '0 30px 60px -20px rgba(0, 0, 0, 0.10)',
        'card-glow': '0 10px 30px -10px rgba(17, 17, 17, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}
