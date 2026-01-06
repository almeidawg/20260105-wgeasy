import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "framer-motion": path.resolve(__dirname, "node_modules/framer-motion/dist/framer-motion.js"),
      "@supabase/supabase-js": path.resolve(__dirname, "node_modules/@supabase/supabase-js/dist/module/index.js"),
      "react-hook-form": path.resolve(__dirname, "node_modules/react-hook-form/dist/index.cjs.js"),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-popover"],
        },
      },
    },
  },
});
