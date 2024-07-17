/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  darkMode: 'class',
  theme: {
    extend: {
      gridTemplateRows: {
        "[auto,auto,1fr]": "auto auto 1fr",
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio"), require("flowbite/plugin")],
};
