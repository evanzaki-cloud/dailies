import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// Everything lives at the top level (no src/ or public/ folders) so the
// project can be uploaded through GitHub's web UI as loose files.
// These four static files are copied into dist/ at build time.
const staticFiles = ["sw.js", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
const copyStatic = () => ({
  name: "copy-static-root-files",
  generateBundle() {
    for (const f of staticFiles) this.emitFile({ type: "asset", fileName: f, source: readFileSync(f) });
  },
});

export default defineConfig({ plugins: [react(), copyStatic()], base: "./", publicDir: false });
