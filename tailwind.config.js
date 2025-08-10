/** @type {import('tailwindcss').Config} */
// This config is only used for development of the CLI tool itself
// The CLI dynamically generates its own config for user directories
module.exports = {
    content: ['./templates/**/*.{html,jsx}', './lib/**/*.js'],
    theme: {
        extend: {},
    },
    plugins: [require('tailwind-dracula')()],
};
