import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";
import "./styles/fonts.css";

const runWhenIdle = (callback: () => void, timeout = 3000) => {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }
  window.setTimeout(callback, timeout);
};

if (import.meta.env.PROD) {
  runWhenIdle(() => {
    import("./lib/sentry").then(({ initSentry }) => initSentry());
  });
}

// 🔥 CRITICAL LOCAL DEV FIX: Bypass cached 301 HTTPS redirects
// Browsers aggressively cache HTTP->HTTPS 301 redirects (from .htaccess).
// Locally, this breaks fetch requests because the local HTTPS cert is untrusted.
// This interceptor forces the browser to treat every local API call as unique.
if (import.meta.env.DEV) {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    if (typeof resource === 'string' && resource.startsWith('/api/')) {
      const url = new URL(resource, window.location.origin);
      url.searchParams.set('_t', Date.now().toString());
      resource = url.toString();
    }
    return originalFetch(resource, config);
  };
}

const rootElement = document.getElementById("root")!;
const app = (
  <HelmetProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);

if (rootElement.hasChildNodes()) {
  rootElement.textContent = "";
}

createRoot(rootElement).render(app);
