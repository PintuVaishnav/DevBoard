import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Needed to simulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: path.resolve(__dirname, "client"), // Root is client/
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"), // Use @ for client/src
    },
  },
  build: {
    outDir: path.resolve(__dirname, "client", "dist"), // Build into client/dist
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000", // Proxy API calls to backend
    },
  },
  // 👇 Enables SPA routing fallback (like /login, /register)
  preview: {
    port: 4173,
    strictPort: true,
  },
});
