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
    'line-through',
    'italic',
    'underline',
    // 'hidden',
    // 'relative',
    // 'absolute',
    // 'fixed',
    // 'w-screen',
    // 'h-screen',
  ],
  plugins: [
    // eslint-disable-next-line import/no-extraneous-dependencies
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};
