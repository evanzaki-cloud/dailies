# Routine and gym tracker

A phone-first checklist for the whole plan: morning shower routine, night skincare, daily body basics, a dumbbell/gym workout logger with progression, and upkeep on a cadence. Rule-driven from a few dates set in settings; the built-in Guide holds the instructions.

Runs entirely in the browser. Data is stored in localStorage, with export/import as a JSON backup in settings.

All files sit at the top level on purpose, so the project can be uploaded through GitHub's web UI without dragging folders.

## Deploy to GitHub Pages

1. Create a public repository and upload every file in this folder (Add file → Upload files, drag them all in, Commit).
2. Actions tab → "set up a workflow yourself" → paste the workflow below → Commit.
3. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. When the Actions run is green, Settings → Pages shows the URL. Open it in Safari on iPhone, Share → Add to Home Screen.

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Run locally

```bash
npm install
npm run dev
```

`npm run build` produces the static site in `dist/`.
