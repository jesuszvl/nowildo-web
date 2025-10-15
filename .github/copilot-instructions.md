## Repo: nowildo-web — Copilot instructions for AI agents

Keep this short and focused. The site is a small Astro (v5) + TypeScript project. Follow the conventions below when creating or editing code.

- Tech stack: Astro (pages + layouts), TypeScript. Config: `astro.config.mjs`, `tsconfig.json` (extends `astro/tsconfigs/strict`).
- Key entry points:

  - `package.json` — dev/build scripts (`npm run dev`, `npm run build`, `npm run preview`).
  - `src/pages/*.astro` — site pages (example: `src/pages/index.astro`).
  - `src/layouts/*.astro` — reusable layouts (example: `src/layouts/Layout.astro`).

- Goals and constraints:

  - Keep output minimal and focused on static-site content. No server APIs or backend code in this repo.
  - Respect TypeScript strict config. New files should type-check against `astro/tsconfigs/strict`.

- Styling & assets:

  - Global CSS is embedded in layout/page files using `<style>` blocks. Prefer using existing CSS variables (`--accent`, `--accent-gradient`) defined in `Layout.astro`.
  - Static assets live in `public/` (example: `public/nw_mock_white.png`). Use root-relative paths (`/...`) when referencing.

- Build & CI:

  - GitHub Actions workflow at `.github/workflows/astro.yml` builds with Node 20 and deploys to GitHub Pages.
  - Use package manager detected by presence of lockfile; `npm` is expected here.

- Developer patterns to follow:

  - Use Astro component conventions: import Layouts with relative paths (`../layouts/Layout.astro`) and pass props via attributes.
  - Keep components small and focused; prefer adding new small .astro components under `src/components/` if needed.
  - For images, prefer `public/` and simple <img> tags (no complex image pipeline exists).

- Examples (follow these exact forms):

  - Page using the layout:
    import Layout from '../layouts/Layout.astro';
    <Layout title="No, Wildo!"> ... </Layout>
  - Link a favicon: `<link rel="icon" type="image/x-icon" href="/favicon.ico" />` (already used in `Layout.astro`).

- When editing or adding files, ensure:

  - `npm run build` still passes locally (this runs `astro check` then `astro build`).
  - No changes break the GitHub Actions workflow (node 20, `npm ci`/`npm install`).

- Notable omissions (do not create these unless requested):

  - No server-side endpoints or API routes (this repo is static). Avoid introducing server-only code or Node runtime endpoints.
  - No heavy frontend frameworks (React/Vue/Svelte) are configured — stick to Astro islands only if adding interactivity and follow Astro docs.

- Helpful files to inspect for context:
  - `README.md` — local dev commands and project description
  - `astro.config.mjs` — site URL and Astro settings
  - `.github/workflows/astro.yml` — CI build & deploy flow

If anything here is unclear or you need more examples (e.g., component conventions or adding client-side interactivity), ask for the specific area to expand.
