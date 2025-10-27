import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          50: '#EBF2FF',
          100: '#D6E4FF',
          200: '#ADC8FF',
          300: '#85ADFF',
          400: '#5C91FF',
          500: '#2563EB',
          600: '#1E50BC',
          700: '#163C8D',
          800: '#0F285E',
          900: '#07142F',
        },
      },
    },
  },
  plugins: [],
}
export default config

