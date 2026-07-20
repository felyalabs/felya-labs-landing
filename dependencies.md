# Dependencies

Authoritative manifests:

| File | Purpose |
| --- | --- |
| `package.json` | Project scripts and direct JavaScript dependencies |
| `bun.lock` | Locked dependency graph |
| `.github/workflows/deploy.yml` | GitHub Pages build/deploy runtime |

## Runtime Expectations

| Environment | Tooling |
| --- | --- |
| Local development | Bun 1.3.14; ripgrep with PCRE2 for verification scans |
| GitHub Actions | Bun 1.3.14 on `ubuntu-slim` |
| Production | Static HTML, CSS, JavaScript, images, fonts, and text files served by GitHub Pages |

## Runtime Services And Assets

| Service or asset | When it is used | Config or source |
| --- | --- | --- |
| GitHub Pages | Serves the site and its access logs | `.github/workflows/deploy.yml`, `public/CNAME` |
| Manrope font files | Same-origin font load from `/fonts/` | `public/fonts/license.md` |
| Formspark `submit-form.com` | Only after the development-updates form is submitted | Endpoint in `src/data/site.js`; form in `src/components/DevelopmentUpdatesSection.astro`; submit handler in `src/scripts/site.js` |
| Local prototype video files | Only after the play cover is selected | `src/components/PrototypesSection.astro`; `src/scripts/site.js` |
| External profile links | Only after a normal outbound link click | `src/data/site.js` |

The site does not use analytics, remote fonts, external scripts, or initial-load embeds.

## Direct Dependencies

| Package | Type | Reason |
| --- | --- | --- |
| `astro` | dev dependency | Static site build, routing, layouts, and endpoints |
| `tailwindcss` | dev dependency | Build-time utility CSS generation for existing Tailwind classes |
| `@tailwindcss/vite` | dev dependency | Tailwind integration for Astro's Vite build |
| `sharp` | dev dependency | Deterministic local generation and optimization of image assets |

## Generated And Local Files

Ignored local/build output:

| Path | Owner |
| --- | --- |
| `node_modules/` | Bun install |
| `dist/` | `bun run build` |
| `.astro/` | Astro tooling |

Static assets that must ship with the site live under `public/assets/` and `public/fonts/`. Astro copies them into `dist/assets/` and `dist/fonts/`. Original sketches, legacy blueprints, masks, and other working files live under `assets-source/` and are deliberately excluded from the production build.
