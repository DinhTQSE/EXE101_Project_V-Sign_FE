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
      "/ai": {
        target: process.env.VITE_AI_PROXY_TARGET || "http://localhost:8000",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/ai/, ""),
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
    },
  },
}));
