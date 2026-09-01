/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5FBF7',
          200: '#ABDBBE',
          400: '#57B77D',
        },
        neutral: {
          50: '#DDE2E8',
          200: '#8EA3B3',
          300: '#6E8597',
          600: '#1F3C51',
          700: '#163043',
          800: '#0F2637',
          900: '#081C2C',
        },
        other: {
          danger: '#DD524C',
          divider: '#EAEEF2',
        },
      },
      fontFamily: {
        'sf-pro-display': ['SfPro'],
        'sf-pro-medium': ['SfProMedium'],
        'sf-pro-bold': ['SfProBold'],
      },
    },
  },
  plugins: [],
};
