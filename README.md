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
| `activation/` | Keys, active devices, trials, and billing behavior. |
| `proof/` | Public speed claims, warm and cold path boundaries, and methodology. |
| `reference/` | Public API, claim-ledger, and file-format reference. |
| `changelog/` | Docs and product-facing changes. |

## Commands

```bash
npm run docs:generate
npm run docs:check
```

`docs:generate` rebuilds `docs.json` and `llms.txt` from `docs.manifest.json`.

`docs:check` verifies public boundaries, navigation, required pages, generated files, and claim references.
