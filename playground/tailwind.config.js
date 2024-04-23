/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  variants: {
    extend: {
      backgroundColor: ['active'],
    },
  },
  safelist: [
    {
      pattern: /bg-([a-zA-Z]+)-(\d+)/,
    },
    {
      pattern: /text-([a-zA-Z]+)-(\d+)/,
    },
    {
      pattern: /font-([a-zA-Z]+)/,
    },
    {
      pattern: /opacity-(\d+)/,
    },
    'line-through',
    'italic',
    'underline',
    'visiable',
    'left-0',
    'top-0',
    'bg-transparent',
    'hidden',
    'relative',
    'absolute',
    'fixed',
    'w-screen',
    'h-screen',
    'inset-0',
  ],
  plugins: [
    // eslint-disable-next-line import/no-extraneous-dependencies
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
