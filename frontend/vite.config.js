import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/office-simulator-2025/",
  build: {
    outDir: "../docs",
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
