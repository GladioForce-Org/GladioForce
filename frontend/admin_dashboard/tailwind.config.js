/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"  // Add SCSS and TS files for purging unused CSS
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
