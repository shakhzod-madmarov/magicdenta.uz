import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  server: { port: 5174 },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("heic2any")) return "heic2any";
            if (id.includes("react-router-dom") || id.includes("react-router")) return "router";
            if (id.includes("chart.js") || id.includes("react-chartjs-2")) return "charts";
            if (id.includes("lucide-react") || id.includes("react-icons")) return "icons";
            if (id.includes("axios") || id.includes("react-toastify")) return "vendor-utils";
            if (id.includes("react") || id.includes("react-dom")) return "react-vendor";
          }
        },
      },
    },
  },
});
