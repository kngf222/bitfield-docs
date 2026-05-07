# Bitfield Docs

Customer-facing documentation for Bitfield.

This repository publishes public docs only. It does not grant rights to Bitfield software, product designs, benchmark presentation, or private materials. See [COPYRIGHT.md](./COPYRIGHT.md).

## Structure

| Area | Purpose |
|---|---|
| `start/` | First-run guides. |
| `concepts/` | Plain-English explanations. |
| `runtime-kit/` | Runtime Kit usage and package docs. |
| `activation/` | Keys, active devices, trials, and billing behavior. |
| `proof/` | Public speed claims with category boundaries. |
| `reference/` | Public API and file-format reference. |
| `changelog/` | Docs and product-facing changes. |

## Commands

```bash
npm run docs:generate
npm run docs:check
```

`docs:generate` rebuilds `docs.json` and `llms.txt` from `docs.manifest.json`.

`docs:check` verifies public boundaries, navigation, required pages, generated files, and claim references.
