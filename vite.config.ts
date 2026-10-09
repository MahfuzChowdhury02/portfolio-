import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // keep three.js in its own lazily loaded chunk
        manualChunks(id) {
          if (id.includes("node_modules/three") || id.includes("@react-three")) return "three";
        },
      },
    },
  },
});
