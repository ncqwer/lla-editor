module.exports = {
  purge: {
    enabled: false,
    content: ['./src/**/*.tsx', './src/**/*.ts'],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {},
  variants: {
    extend: {
      backgroundColor: ['active'],
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
