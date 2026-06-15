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
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((dep) => !/(pdf|charts|motion|html2pdf|CRMLayout|LRReceipt|sentry)-/i.test(dep)),
    },
    // Minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
        pure_funcs: mode === "production" ? ["console.log", "console.info", "console.debug", "console.warn"] : [],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        // Manual chunk splitting - simplified
        manualChunks: {
          // Core vendor chunk
          "vendor": ["react", "react-dom", "react-router-dom"],
          // Radix UI components chunk
          "ui": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-slot"],
          // Animation chunk
          "motion": ["framer-motion"],
          // Data fetching chunk
          "query": ["@tanstack/react-query"],
          // Icons chunk
          "icons": ["lucide-react"],
          // Charts & PDF chunk (heavy, admin-only)
          "charts": ["recharts"],
          "pdf": ["jspdf", "html-to-image"],
        },
        // Optimize chunk file naming
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(name)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    // Don't let Vite delete dist/ (causes EPERM on Windows/XAMPP due to file locking)
    // We manually clean dist/ before each build instead
    emptyOutDir: false,
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Generate source maps for production (disabled for max performance)
    sourcemap: false,
    // Enable CSS minification
    cssMinify: true,
    // Report compressed size
    reportCompressedSize: true,
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "lucide-react",
      "@tanstack/react-query",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
    exclude: [],
  },
  // Performance hints
  esbuild: {
    // Drop console and debugger in production
    drop: mode === "production" ? ["console", "debugger"] : [],
    // Tree shaking
    treeShaking: true,
    // Target modern browsers for smaller output
    target: "ES2022",
  },
}));