import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        rsa: {
          bg: '#0b1017',
          surface: '#121b26',
          border: '#2c3643',
          gold: '#c9a55a',
          text: '#f8f8f4'
        }
      },
      boxShadow: {
        card: '0 12px 32px rgba(0, 0, 0, 0.24)'
      }
    }
  },
  plugins: []
};

export default config;
