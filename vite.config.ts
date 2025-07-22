import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default defineConfig({
  // The project’s React code lives here
  root: path.resolve(__dirname, "client"),

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
    },
  },

  build: {
    // ⬇️  Put the production files in  client/dist
    outDir: path.resolve(__dirname, "client", "dist"),
    emptyOutDir: true,
  },

  server: {
    // Your backend API
    proxy: {
      "/api": "http://localhost:5000",
    },
    // ⬇️  Tell Vite to fall back to index.html for SPA routes
    spaFallback: true,
  },
});
