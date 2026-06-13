// vite.config.ts
import { defineConfig } from "file:///C:/xampp/htdocs/panyaglobal-local/node_modules/vite/dist/node/index.js";
import react from "file:///C:/xampp/htdocs/panyaglobal-local/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/xampp/htdocs/panyaglobal-local/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\xampp\\htdocs\\panyaglobal-local";
var vite_config_default = defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost/panyaglobal-local/public_html",
        changeOrigin: true
      }
    }
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
          return html.replace("</head>", `${critical}</head>`).replace(
            /<link rel="stylesheet" crossorigin href="(\.\/assets\/index-[^"]+\.css)">/g,
            `<link rel="preload" as="style" href="$1" onload="this.onload=null;this.rel='stylesheet'" /><noscript><link rel="stylesheet" crossorigin href="$1"></noscript>`
          );
        }
      }
    },
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  // PRODUCTION OPTIMIZATIONS
  build: {
    modulePreload: {
      resolveDependencies: (_filename, deps) => deps.filter((dep) => !/(pdf|charts|motion|html2pdf|CRMLayout|LRReceipt|sentry)-/i.test(dep))
    },
    // Minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
        pure_funcs: mode === "production" ? ["console.log", "console.info", "console.debug", "console.warn"] : [],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
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
          "pdf": ["jspdf", "html-to-image"]
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
        }
      }
    },
    // Don't let Vite delete dist/ (causes EPERM on Windows/XAMPP due to file locking)
    // We manually clean dist/ before each build instead
    emptyOutDir: false,
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1e3,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Generate source maps for production (disabled for max performance)
    sourcemap: false,
    // Enable CSS minification
    cssMinify: true,
    // Report compressed size
    reportCompressedSize: true
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
      "tailwind-merge"
    ],
    exclude: []
  },
  // Performance hints
  esbuild: {
    // Drop console and debugger in production
    drop: mode === "production" ? ["console", "debugger"] : [],
    // Tree shaking
    treeShaking: true,
    // Target modern browsers for smaller output
    target: "ES2022"
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFx4YW1wcFxcXFxodGRvY3NcXFxccGFueWFnbG9iYWwtbG9jYWxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXHhhbXBwXFxcXGh0ZG9jc1xcXFxwYW55YWdsb2JhbC1sb2NhbFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzoveGFtcHAvaHRkb2NzL3BhbnlhZ2xvYmFsLWxvY2FsL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBiYXNlOiBcIi4vXCIsXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdC9wYW55YWdsb2JhbC1sb2NhbC9wdWJsaWNfaHRtbCcsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgLy8gRGVmZXIgbm9uLWNyaXRpY2FsIENTUyArIGluamVjdCBjcml0aWNhbCBpbmxpbmUgQ1NTXG4gICAge1xuICAgICAgbmFtZTogXCJhc3luYy1jc3NcIixcbiAgICAgIHRyYW5zZm9ybUluZGV4SHRtbDoge1xuICAgICAgICBvcmRlcjogXCJwb3N0XCIsXG4gICAgICAgIGhhbmRsZXIoaHRtbCkge1xuICAgICAgICAgIGNvbnN0IGNyaXRpY2FsID0gYDxzdHlsZT5ib2R5e21hcmdpbjowO21pbi1oZWlnaHQ6MTAwdmg7b3ZlcmZsb3cteDpoaWRkZW47YmFja2dyb3VuZDojMDAwO2ZvbnQtZmFtaWx5OkludGVyLHN5c3RlbS11aSxzYW5zLXNlcmlmOy13ZWJraXQtZm9udC1zbW9vdGhpbmc6YW50aWFsaWFzZWR9LmZpeGVke3Bvc2l0aW9uOmZpeGVkfS5pbnNldC0we3RvcDowO3JpZ2h0OjA7Ym90dG9tOjA7bGVmdDowfS56LTUwe3otaW5kZXg6NTB9Lm1pbi1oLXNjcmVlbnttaW4taGVpZ2h0OjEwMHZofS5vdmVyZmxvdy1oaWRkZW57b3ZlcmZsb3c6aGlkZGVufS5hYnNvbHV0ZXtwb3NpdGlvbjphYnNvbHV0ZX0ucmVsYXRpdmV7cG9zaXRpb246cmVsYXRpdmV9LmZsZXh7ZGlzcGxheTpmbGV4fS5mbGV4LWNvbHtmbGV4LWRpcmVjdGlvbjpjb2x1bW59Lml0ZW1zLWNlbnRlcnthbGlnbi1pdGVtczpjZW50ZXJ9LnctZnVsbHt3aWR0aDoxMDAlfS5oLWZ1bGx7aGVpZ2h0OjEwMCV9Lm9iamVjdC1jb3ZlcntvYmplY3QtZml0OmNvdmVyfUBtZWRpYShtaW4td2lkdGg6NzY4cHgpey5tZFxcXFw6YmxvY2t7ZGlzcGxheTpibG9ja30ubGdcXFxcOmhpZGRlbntkaXNwbGF5Om5vbmV9fTwvc3R5bGU+YDtcbiAgICAgICAgICByZXR1cm4gaHRtbFxuICAgICAgICAgICAgLnJlcGxhY2UoXCI8L2hlYWQ+XCIsIGAke2NyaXRpY2FsfTwvaGVhZD5gKVxuICAgICAgICAgICAgLnJlcGxhY2UoXG4gICAgICAgICAgICAgIC88bGluayByZWw9XCJzdHlsZXNoZWV0XCIgY3Jvc3NvcmlnaW4gaHJlZj1cIihcXC5cXC9hc3NldHNcXC9pbmRleC1bXlwiXStcXC5jc3MpXCI+L2csXG4gICAgICAgICAgICAgIGA8bGluayByZWw9XCJwcmVsb2FkXCIgYXM9XCJzdHlsZVwiIGhyZWY9XCIkMVwiIG9ubG9hZD1cInRoaXMub25sb2FkPW51bGw7dGhpcy5yZWw9J3N0eWxlc2hlZXQnXCIgLz48bm9zY3JpcHQ+PGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGNyb3Nzb3JpZ2luIGhyZWY9XCIkMVwiPjwvbm9zY3JpcHQ+YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIC8vIFBST0RVQ1RJT04gT1BUSU1JWkFUSU9OU1xuICBidWlsZDoge1xuICAgIG1vZHVsZVByZWxvYWQ6IHtcbiAgICAgIHJlc29sdmVEZXBlbmRlbmNpZXM6IChfZmlsZW5hbWUsIGRlcHMpID0+XG4gICAgICAgIGRlcHMuZmlsdGVyKChkZXApID0+ICEvKHBkZnxjaGFydHN8bW90aW9ufGh0bWwycGRmfENSTUxheW91dHxMUlJlY2VpcHR8c2VudHJ5KS0vaS50ZXN0KGRlcCkpLFxuICAgIH0sXG4gICAgLy8gTWluaWZpY2F0aW9uXG4gICAgbWluaWZ5OiBcInRlcnNlclwiLFxuICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgIGRyb3BfY29uc29sZTogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIsXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IG1vZGUgPT09IFwicHJvZHVjdGlvblwiLFxuICAgICAgICBwdXJlX2Z1bmNzOiBtb2RlID09PSBcInByb2R1Y3Rpb25cIiA/IFtcImNvbnNvbGUubG9nXCIsIFwiY29uc29sZS5pbmZvXCIsIFwiY29uc29sZS5kZWJ1Z1wiLCBcImNvbnNvbGUud2FyblwiXSA6IFtdLFxuICAgICAgICBwYXNzZXM6IDIsXG4gICAgICB9LFxuICAgICAgbWFuZ2xlOiB7XG4gICAgICAgIHNhZmFyaTEwOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIGZvcm1hdDoge1xuICAgICAgICBjb21tZW50czogZmFsc2UsXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gQ29kZSBzcGxpdHRpbmcgZm9yIGJldHRlciBjYWNoaW5nXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIC8vIE1hbnVhbCBjaHVuayBzcGxpdHRpbmcgLSBzaW1wbGlmaWVkXG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIC8vIENvcmUgdmVuZG9yIGNodW5rXG4gICAgICAgICAgXCJ2ZW5kb3JcIjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIiwgXCJyZWFjdC1yb3V0ZXItZG9tXCJdLFxuICAgICAgICAgIC8vIFJhZGl4IFVJIGNvbXBvbmVudHMgY2h1bmtcbiAgICAgICAgICBcInVpXCI6IFtcIkByYWRpeC11aS9yZWFjdC1kaWFsb2dcIiwgXCJAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudVwiLCBcIkByYWRpeC11aS9yZWFjdC1zbG90XCJdLFxuICAgICAgICAgIC8vIEFuaW1hdGlvbiBjaHVua1xuICAgICAgICAgIFwibW90aW9uXCI6IFtcImZyYW1lci1tb3Rpb25cIl0sXG4gICAgICAgICAgLy8gRGF0YSBmZXRjaGluZyBjaHVua1xuICAgICAgICAgIFwicXVlcnlcIjogW1wiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCJdLFxuICAgICAgICAgIC8vIEljb25zIGNodW5rXG4gICAgICAgICAgXCJpY29uc1wiOiBbXCJsdWNpZGUtcmVhY3RcIl0sXG4gICAgICAgICAgLy8gQ2hhcnRzICYgUERGIGNodW5rIChoZWF2eSwgYWRtaW4tb25seSlcbiAgICAgICAgICBcImNoYXJ0c1wiOiBbXCJyZWNoYXJ0c1wiXSxcbiAgICAgICAgICBcInBkZlwiOiBbXCJqc3BkZlwiLCBcImh0bWwtdG8taW1hZ2VcIl0sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIE9wdGltaXplIGNodW5rIGZpbGUgbmFtaW5nXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKSA9PiB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IGFzc2V0SW5mby5uYW1lIHx8IFwiXCI7XG4gICAgICAgICAgaWYgKC9cXC4ocG5nfGpwZT9nfGdpZnxzdmd8d2VicHxpY28pJC9pLnRlc3QobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBcImFzc2V0cy9pbWFnZXMvW25hbWVdLVtoYXNoXVtleHRuYW1lXVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoL1xcLih3b2ZmMj98dHRmfG90Znxlb3QpJC9pLnRlc3QobmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBcImFzc2V0cy9mb250cy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBcImFzc2V0cy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdXCI7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gRG9uJ3QgbGV0IFZpdGUgZGVsZXRlIGRpc3QvIChjYXVzZXMgRVBFUk0gb24gV2luZG93cy9YQU1QUCBkdWUgdG8gZmlsZSBsb2NraW5nKVxuICAgIC8vIFdlIG1hbnVhbGx5IGNsZWFuIGRpc3QvIGJlZm9yZSBlYWNoIGJ1aWxkIGluc3RlYWRcbiAgICBlbXB0eU91dERpcjogZmFsc2UsXG4gICAgLy8gUmVkdWNlIGNodW5rIHNpemUgd2FybmluZ3NcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgLy8gRW5hYmxlIENTUyBjb2RlIHNwbGl0dGluZ1xuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICAvLyBHZW5lcmF0ZSBzb3VyY2UgbWFwcyBmb3IgcHJvZHVjdGlvbiAoZGlzYWJsZWQgZm9yIG1heCBwZXJmb3JtYW5jZSlcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgIC8vIEVuYWJsZSBDU1MgbWluaWZpY2F0aW9uXG4gICAgY3NzTWluaWZ5OiB0cnVlLFxuICAgIC8vIFJlcG9ydCBjb21wcmVzc2VkIHNpemVcbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogdHJ1ZSxcbiAgfSxcbiAgLy8gT3B0aW1pemUgZGVwZW5kZW5jaWVzIHByZS1idW5kbGluZ1xuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICBcInJlYWN0XCIsXG4gICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgXCJyZWFjdC1yb3V0ZXItZG9tXCIsXG4gICAgICBcImZyYW1lci1tb3Rpb25cIixcbiAgICAgIFwibHVjaWRlLXJlYWN0XCIsXG4gICAgICBcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiLFxuICAgICAgXCJjbGFzcy12YXJpYW5jZS1hdXRob3JpdHlcIixcbiAgICAgIFwiY2xzeFwiLFxuICAgICAgXCJ0YWlsd2luZC1tZXJnZVwiLFxuICAgIF0sXG4gICAgZXhjbHVkZTogW10sXG4gIH0sXG4gIC8vIFBlcmZvcm1hbmNlIGhpbnRzXG4gIGVzYnVpbGQ6IHtcbiAgICAvLyBEcm9wIGNvbnNvbGUgYW5kIGRlYnVnZ2VyIGluIHByb2R1Y3Rpb25cbiAgICBkcm9wOiBtb2RlID09PSBcInByb2R1Y3Rpb25cIiA/IFtcImNvbnNvbGVcIiwgXCJkZWJ1Z2dlclwiXSA6IFtdLFxuICAgIC8vIFRyZWUgc2hha2luZ1xuICAgIHRyZWVTaGFraW5nOiB0cnVlLFxuICAgIC8vIFRhcmdldCBtb2Rlcm4gYnJvd3NlcnMgZm9yIHNtYWxsZXIgb3V0cHV0XG4gICAgdGFyZ2V0OiBcIkVTMjAyMlwiLFxuICB9LFxufSkpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlIsU0FBUyxvQkFBb0I7QUFDMVQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUE7QUFBQSxJQUVOO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixvQkFBb0I7QUFBQSxRQUNsQixPQUFPO0FBQUEsUUFDUCxRQUFRLE1BQU07QUFDWixnQkFBTSxXQUFXO0FBQ2pCLGlCQUFPLEtBQ0osUUFBUSxXQUFXLEdBQUcsUUFBUSxTQUFTLEVBQ3ZDO0FBQUEsWUFDQztBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsUUFDSjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxFQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IscUJBQXFCLENBQUMsV0FBVyxTQUMvQixLQUFLLE9BQU8sQ0FBQyxRQUFRLENBQUMsNERBQTRELEtBQUssR0FBRyxDQUFDO0FBQUEsSUFDL0Y7QUFBQTtBQUFBLElBRUEsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1IsY0FBYyxTQUFTO0FBQUEsUUFDdkIsZUFBZSxTQUFTO0FBQUEsUUFDeEIsWUFBWSxTQUFTLGVBQWUsQ0FBQyxlQUFlLGdCQUFnQixpQkFBaUIsY0FBYyxJQUFJLENBQUM7QUFBQSxRQUN4RyxRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQSxRQUVOLGNBQWM7QUFBQTtBQUFBLFVBRVosVUFBVSxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQTtBQUFBLFVBRW5ELE1BQU0sQ0FBQywwQkFBMEIsaUNBQWlDLHNCQUFzQjtBQUFBO0FBQUEsVUFFeEYsVUFBVSxDQUFDLGVBQWU7QUFBQTtBQUFBLFVBRTFCLFNBQVMsQ0FBQyx1QkFBdUI7QUFBQTtBQUFBLFVBRWpDLFNBQVMsQ0FBQyxjQUFjO0FBQUE7QUFBQSxVQUV4QixVQUFVLENBQUMsVUFBVTtBQUFBLFVBQ3JCLE9BQU8sQ0FBQyxTQUFTLGVBQWU7QUFBQSxRQUNsQztBQUFBO0FBQUEsUUFFQSxnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0IsQ0FBQyxjQUFjO0FBQzdCLGdCQUFNLE9BQU8sVUFBVSxRQUFRO0FBQy9CLGNBQUksbUNBQW1DLEtBQUssSUFBSSxHQUFHO0FBQ2pELG1CQUFPO0FBQUEsVUFDVDtBQUNBLGNBQUksMkJBQTJCLEtBQUssSUFBSSxHQUFHO0FBQ3pDLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUE7QUFBQTtBQUFBLElBR0EsYUFBYTtBQUFBO0FBQUEsSUFFYix1QkFBdUI7QUFBQTtBQUFBLElBRXZCLGNBQWM7QUFBQTtBQUFBLElBRWQsV0FBVztBQUFBO0FBQUEsSUFFWCxXQUFXO0FBQUE7QUFBQSxJQUVYLHNCQUFzQjtBQUFBLEVBQ3hCO0FBQUE7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLENBQUM7QUFBQSxFQUNaO0FBQUE7QUFBQSxFQUVBLFNBQVM7QUFBQTtBQUFBLElBRVAsTUFBTSxTQUFTLGVBQWUsQ0FBQyxXQUFXLFVBQVUsSUFBSSxDQUFDO0FBQUE7QUFBQSxJQUV6RCxhQUFhO0FBQUE7QUFBQSxJQUViLFFBQVE7QUFBQSxFQUNWO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
