import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(() => {
  const dynamicHost = process.env.VITE_ALLOWED_HOST;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5177,
      strictPort: false,
      allowedHosts: [
        ".trycloudflare.com",
        "host.docker.internal",
        ...(dynamicHost
          ? [dynamicHost.replace("https://", "").replace("http://", "")]
          : []),
      ],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: true,
    },
    css: {
      devSourcemap: true,
    },
  };
});
