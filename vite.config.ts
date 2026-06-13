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
    },
  },
  plugins: [
    react(),
    // Defer non-critical CSS + inject critical inline CSS
    {
      name: "async-css",
      transformIndexHtml: {
        order: "post",
        handler(html) {
          const critical = `<style>body{margin:0;min-height:100vh;overflow-x:hidden;background:#000;font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}.fixed{position:fixed}.inset-0{top:0;right:0;bottom:0;left:0}.z-50{z-index:50}.min-h-screen{min-height:100vh}.overflow-hidden{overflow:hidden}.absolute{position:absolute}.relative{position:relative}.flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}.w-full{width:100%}.h-full{height:100%}.object-cover{object-fit:cover}@media(min-width:768px){.md\\:block{display:block}.lg\\:hidden{display:none}}</style>`;
          return html
            .replace("</head>", `${critical}</head>`)
            .replace(
              /<link rel="stylesheet" crossorigin href="(\.\/assets\/index-[^"]+\.css)">/g,
              `<link rel="preload" as="style" href="$1" onload="this.onload=null;this.rel='stylesheet'" /><noscript><link rel="stylesheet" crossorigin href="$1"></noscript>`
            );
        },
      },
    },
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