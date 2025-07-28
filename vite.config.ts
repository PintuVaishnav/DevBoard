import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Needed for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: path.resolve(__dirname, "client"),
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "client", "dist"),
      emptyOutDir: true,
    },
    server: {
      proxy: {
        "/api": env.VITE_API_BASE_URL || "http://localhost:5000",
      },
    },
  };
});
