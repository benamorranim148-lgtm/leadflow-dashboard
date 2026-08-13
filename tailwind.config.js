/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          950: '#0B2E44',
          900: '#0F3A54',
          850: '#12405E',
          800: '#1B4F72',
          700: '#25628A',
        },
        paper: '#F4F7F6',
        signal: '#FFB627',
        good: '#4FAE7D',
        line: 'rgba(245, 250, 255, 0.10)',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
