/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#92003A",       // Rich Wine / Bordeaux Crimson
        secondary: "#403D88",     // Royal Iris / Indigo
        magenta: "#91008D",       // Electric Orchid / Magenta
        navy: "#0F3040",          // Midnight Petrol / Prussian Navy
        plum: "#321E48",          // Imperial Velvet Plum
        brandDark: "#0F3040",
        brandPlum: "#321E48",
        brandIndigo: "#403D88",
        brandWine: "#92003A",
        brandMagenta: "#91008D",
        surface: "#F8F9FD",
        surfaceCard: "#FFFFFF",
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0F3040 0%, #221838 50%, #321E48 100%)',
        'gradient-brand': 'linear-gradient(135deg, #92003A 0%, #91008D 100%)',
        'gradient-indigo': 'linear-gradient(135deg, #403D88 0%, #321E48 100%)',
      },
      boxShadow: {
        'glow-wine': '0 10px 30px -4px rgba(146, 0, 58, 0.35)',
        'glow-indigo': '0 10px 30px -4px rgba(64, 61, 136, 0.35)',
      },
    },
  },
  plugins: [],
};
