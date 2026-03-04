/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        discord: {
          DEFAULT: '#5865F2',
          dark: '#4752C4',
          green: '#57F287',
          red: '#ED4245',
          yellow: '#FEE75C',
          blurple: '#5865F2',
          bg: '#36393f',
          sidebar: '#2f3136',
          card: '#40444b',
          text: '#dcddde',
          muted: '#72767d'
        }
      }
    }
  },
  plugins: []
}

