# Proof Docs

This folder owns public proof pages for Bitfield speed claims.

## Pages

- `how-bitfield-is-fast.mdx` explains the public mechanism story.
- `warm-and-cold-paths.mdx` separates warm, cold, local, and network categories.
- `benchmark-ledger.mdx` lists public benchmark rows and their allowed meaning.
- `methodology.mdx` explains how benchmark categories must be read.
- `comparison-guardrails.mdx` prevents unlike-job comparisons.
- `objection-faq.mdx` answers skeptical speed-claim questions.

## Boundary

Public proof pages may explain mechanism categories, measured jobs, units, non-claims, and public source families.

Public proof pages must not publish private file layouts, private binary encodings, private scheduling logic, raw work logs, local machine paths, private instruction material, or private project material.

## Validation

Run this from the docs root after editing proof pages:

```bash
npm run docs:generate
npm run docs:check
npm run docs:mint
git diff --check
```
