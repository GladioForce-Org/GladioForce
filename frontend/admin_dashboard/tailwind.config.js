/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
    "./node_modules/flowbite/**/*.js"   // Add SCSS and TS files for purging unused CSS
  ],
  theme: {
    extend: {},
  },
  plugins: [require('flowbite/plugin')],
};
