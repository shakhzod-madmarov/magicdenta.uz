import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  const proxyTarget = (env.TV_PROXY_TARGET || "http://localhost:5000").replace(
    /\/$/,
    "",
  );
  const screenKey = env.SCREEN_KEY || env.VITE_SCREEN_KEY || "";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/__queue_feed": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: () => "/api/public/queue",
          headers: screenKey ? { "x-screen-key": screenKey } : {},
        },
        "/uploads": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react-router-dom") || id.includes("react-router")) return "router";
              if (id.includes("lucide-react") || id.includes("react-icons")) return "icons";
              if (id.includes("slick-carousel") || id.includes("react-slick")) return "carousel";
              if (id.includes("axios") || id.includes("react-toastify")) return "vendor-utils";
              if (id.includes("react") || id.includes("react-dom")) return "react-vendor";
            }
          },
        },
      },
    },
  };
});
