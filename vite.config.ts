import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost/panyaglobal-local/public_html',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost/panyaglobal-local/public_html',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    // NOTE: async-css plugin removed — it was deferring CSS on Netlify causing layout shifts (FOUC)
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // PRODUCTION OPTIMIZATIONS
  build: {
    // Disable sourcemaps for faster builds
    sourcemap: false,
    // Use esbuild for minification (default and fastest)
    minify: "esbuild",
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1500,
    // emptyOutDir false to prevent EPERM on Windows XAMPP
    emptyOutDir: false,
  },
  // Performance hints
  esbuild: {
    // Drop console and debugger in production
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));