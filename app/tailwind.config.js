/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./screens/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./index.html"
    ],
    theme: {
        extend: {
            colors: {
                wf: {
                    primary: "#E8503A",
                    secondary: "#111111",
                    bg: "#0D0D0D",
                    card: "#1A1A1A",
                    text: "#FFFFFF",
                    muted: "#C5C5C5",
                    accent: "#FFD35A"
                }
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
                serif: ['"New York"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif']
            }
        }
    },
    plugins: [],
}
