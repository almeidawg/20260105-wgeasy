import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Força entrada CommonJS do framer-motion (bundle não-UMD)
      "framer-motion": path.resolve(
        __dirname,
        "node_modules/framer-motion/dist/cjs/index.js"
      ),
      "@supabase/supabase-js": path.resolve(
        __dirname,
        "node_modules/@supabase/supabase-js/dist/index.mjs"
      ),
      "react-hook-form": path.resolve(
        __dirname,
        "node_modules/react-hook-form/dist/index.cjs.js"
      ),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    allowedHosts: true, // ← ADICIONADO: permite acesso de qualquer host
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("pdfjs") || id.includes("jspdf")) return "pdf";
            if (id.includes("xlsx") || id.includes("jszip")) return "xlsx";
            if (id.includes("react-router")) return "router";
            if (id.includes("radix-ui")) return "ui";
            if (id.includes("lucide-react")) return "icons";
            return "vendor";
          }
        },
      },
    },
  },
});
