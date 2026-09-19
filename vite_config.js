import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// Everything lives at the top level (no src/ or public/ folders) so the
// project can be uploaded through GitHub's web UI as loose files.
//
// The service worker, manifest and icons must stay at the site root with
// their real names (the manifest's start_url and the SW scope depend on
// it), so they are copied into dist/ unhashed, and the <link> tags that
// point at them are injected after Vite's asset pass so Vite leaves them
// alone.
const staticFiles = ["sw.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

const staticRoot = () => ({
  name: "static-root-files",
  generateBundle() {
    for (const f of staticFiles) {
      this.emitFile({ type: "asset", fileName: f, source: readFileSync(f) });
    }
  },
  transformIndexHtml: {
    order: "post",
    handler() {
      return [
        { tag: "link", attrs: { rel: "manifest", href: "./manifest.webmanifest" }, injectTo: "head" },
        { tag: "link", attrs: { rel: "apple-touch-icon", href: "./icon-192.png" }, injectTo: "head" },
        { tag: "link", attrs: { rel: "icon", href: "./icon-192.png" }, injectTo: "head" },
      ];
    },
  },
});

export default defineConfig({
  plugins: [react(), staticRoot()],
  base: "./",
  publicDir: false,
});
