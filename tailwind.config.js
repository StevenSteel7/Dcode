/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./popup.html",         // Your HTML file
    "./src/**/*.{js,html}", // JS and HTML files in the src directory
    // Optionally include other directories/files as needed
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
