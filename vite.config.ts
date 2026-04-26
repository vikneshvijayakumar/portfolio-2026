import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) {
              return "framer-motion";
            }
            if (id.includes("react-dom")) return "react-dom";
            if (id.includes("react") || id.includes("scheduler")) return "react";
            if (id.includes("@vercel")) return "vercel";
          }
        },
      },
    },
  },
});
