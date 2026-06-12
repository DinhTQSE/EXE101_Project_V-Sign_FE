import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: Number(process.env.VITE_DEV_PORT) || 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api/v1": {
        target: process.env.VITE_BACKEND_PROXY_TARGET || "http://localhost:8080",
        changeOrigin: true,
        rewrite: (requestPath) => {
          const servletPrefix = (process.env.VITE_BACKEND_SERVLET_PREFIX ?? "/V-sign").replace(/\/$/, "");
          return servletPrefix ? requestPath.replace(/^\/api\/v1/, `${servletPrefix}/api/v1`) : requestPath;
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@mediapipe")) return "mediapipe";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("vaul") || id.includes("embla-carousel") || id.includes("input-otp") || id.includes("react-day-picker")) return "ui-vendor";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("date-fns")) return "date-vendor";
          return "vendor";
        },
      },
    },
  },
}));
