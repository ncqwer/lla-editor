module.exports = {
  purge: {
    enabled: true,
    content: ['./src/**/*.tsx', './src/**/*.ts', './src/**/*.css'],
    safelist: [
      'text-gray-300',
      'text-black-300',
      'text-gray-300',
      'text-red-300',
      'text-yellow-300',
      'text-green-300',
      'text-blue-300',
      'text-purple-300',
      'text-pink-300',
      'text-indigo-300',
      'bg-white',
      'bg-gray-50',
      'bg-black-50',
      'bg-gray-50',
      'bg-red-50',
      'bg-yellow-50',
      'bg-green-50',
      'bg-blue-50',
      'bg-purple-50',
      'bg-pink-50',
      'bg-indigo-50',
      'relative',
      'absolute',
      'fixed',
    ],
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
