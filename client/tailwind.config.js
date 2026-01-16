/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'biz-yellow': '#FFD08B',
                'biz-dark': '#252423',
                'biz-light': '#F3F4EF',
                'biz-gray': '#333740'
            }
        },
    },
    plugins: [],
}
