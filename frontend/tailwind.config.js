/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#92003A",
        secondary: "#403D88",
        thirdary: "#91008D",
        brandDark: "#0F3040",
        brandPlum: "#321E48",
        brandMagenta: "#91008D",
        brandWine: "#92003A",
        brandIndigo: "#403D88",
        brandTeal: "#0F3040",
        white: "#ffffff",
        black: "#000000",
        grayLight: "#FAF8FB",
        grayDark: "#1E1A24",
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(146, 0, 58, 0.05)',
        'card': '0 10px 30px -4px rgba(50, 30, 72, 0.06)',
        'premium': '0 20px 40px -8px rgba(15, 48, 64, 0.12)',
      },
    },
  },
  plugins: [],
};
