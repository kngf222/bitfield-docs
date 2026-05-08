# Bitfield Docs

Customer-facing documentation for Bitfield.

This repository publishes public docs only. It does not grant rights to Bitfield software, product designs, benchmark presentation, or private materials. See [COPYRIGHT.md](./COPYRIGHT.md).

## Structure

| Area | Purpose |
|---|---|
| `start/` | First-run guides. |
| `concepts/` | Concept explanations, including storage shape and content addresses. |
| `runtime-kit/` | Runtime Kit usage and package docs. |
| `workflows/` | Complete package and Runtime Kit examples. |
| `examples/` | Machine-validated public example fixtures used by workflow pages. |
| `logo/` | Public docs logo assets. The wordmark is the Apple Garamond Bitfield mark from the site exported as SVG outlines. |
| `favicon.svg` | Public docs browser icon using the current Bitfield square mark. |
| `activation/` | Keys, active devices, trials, and billing behavior. |
| `proof/` | Public speed claims, warm and cold path boundaries, and methodology. |
| `reference/` | Public API, claim-ledger, and file-format reference. |
| `changelog/` | Docs and product-facing changes. |
| `workflow-examples.json` | Source of truth for workflow example files and their docs routes. |

## Commands

```bash
npm run docs:generate
npm run docs:check
```

`docs:generate` rebuilds `docs.json` and `llms.txt` from `docs.manifest.json`.

`docs:check` verifies public boundaries, workflow examples, navigation, required pages, generated files, and claim references.
