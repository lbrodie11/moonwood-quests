import { defineConfig, type Plugin } from "vitest/config";

/**
 * Content Security Policy injected into production builds only.
 * (A meta CSP in dev would block Vite's HMR websocket.)
 *
 * The game loads nothing from third-party origins: no analytics, ads,
 * CDNs or web fonts. Keep it that way. See .agents/skills/coppa-data-minimization.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join("; ");

function contentSecurityPolicy(): Plugin {
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        "<!-- CSP -->",
        `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      );
    },
  };
}

export default defineConfig({
  plugins: [contentSecurityPolicy()],
  build: {
    target: "es2022",
    // Phaser alone is ~1.3 MB minified; the warning limit reflects that.
    // Track the first-playable budget (3–5 MB compressed) in README.md.
    chunkSizeWarningLimit: 1800,
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
