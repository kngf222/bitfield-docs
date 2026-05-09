# Bitfield Docs

Customer-facing documentation for Bitfield.

This repository publishes public docs only. It does not grant rights to Bitfield software, product designs, benchmark presentation, or private materials. See [COPYRIGHT.md](./COPYRIGHT.md).

## Structure

| Area | Purpose |
|---|---|
| `start/` | First-run guides. |
| `concepts/` | Concept explanations, including storage shape and content addresses. |
| `runtime-kit/` | Runtime Kit usage and package docs. |
| `cookbook/` | Complete package and Runtime Kit examples. |
| `examples/` | Machine-validated public example fixtures used by cookbook pages. |
| `logo/` | Mintlify navbar logo assets. The wordmark is the Apple Garamond Bitfield mark from the site exported as SVG outlines. |
| `brand/` | Public Bitfield mark and wordmark assets mirrored from `bitfield-site`. |
| `social/` | Open Graph, X, and LinkedIn social preview images mirrored from `bitfield-site`. |
| `favicon.svg`, `favicon-*.png`, `apple-touch-icon.png`, `icon-*.png`, `site.webmanifest` | Browser, tab, mobile, and install icons using the current Bitfield square mark. |
| `activation/` | Keys, active devices, trials, and billing behavior. |
| `proof/` | Public speed claims, warm and cold path boundaries, and methodology. |
| `reference/` | Public API, claim-ledger, and file-format reference. |
| `changelog/` | Docs and product-facing changes. |
| `cookbook-examples.json` | Source of truth for cookbook example files and their docs routes. |
| `.github/workflows/docs.yml` | Pull request and main-branch docs quality gate. |

`examples/` is ignored by Mintlify directly. Cookbook pages embed the public snippets, and `docs:check` verifies the embedded snippets match the fixture files exactly.

## Commands

```bash
npm run docs:generate
npm run docs:check
npm run docs:mint
```

`docs:generate` rebuilds `docs.json`, `llms.txt`, `theme.css`, and `theme.js` from `docs.manifest.json`.

`docs:check` verifies public boundaries, cookbook examples, navigation, required pages, generated files, and claim references.

`docs:mint` runs Mintlify build validation, broken-link checks, snippet checks, and accessibility checks with the repo-pinned CLI.

## CI

The GitHub Actions docs workflow installs the locked npm dependencies, regenerates docs outputs, runs the public-boundary and docs-depth checks, runs Mintlify validation, confirms generated files are committed, and runs whitespace diff checks.
