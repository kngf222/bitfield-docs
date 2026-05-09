# Contributing To Bitfield Docs

This repository contains customer-facing documentation only. Every change must improve what a customer, founder, developer, or AI assistant can understand or do with Bitfield.

## Change Flow

1. Identify the public reader job.
2. Find the source contract that owns the fact.
3. Update the MDX page, README contract, manifest metadata, and generated outputs together.
4. Run the full docs gate.
5. Commit the docs change as one checkpoint.

## Source-Backed Writing

Every public claim needs a source owner:

| Claim type | Source owner |
|---|---|
| Runtime Kit API behavior | Runtime Kit public package docs and public surface tests |
| Package boundary fields | Package boundary schema and validated cookbook examples |
| Account, key, billing, or active-device behavior | Public account lifecycle copy and public legal pages |
| Speed or benchmark claim | Public claim ledger and proof pages |
| Navigation or page grouping | Docs manifest |
| Public examples | Files under `examples/` plus `cookbook-examples.json` |

Do not write a public fact because it sounds right. Write it because the source owner says it is true.

## Public Boundary

Public docs may explain:

- What a customer can do
- What app code imports
- What package files a customer owns
- What the account portal is responsible for
- What a benchmark category measures
- What a claim does not measure

Public docs must not expose:

- Machine-local paths
- Private repo names
- Raw benchmark work logs
- Unpublished APIs
- Account-provider wiring
- Team-only release chores
- Hidden prompts or private AI instructions
- Low-level implementation details that are not part of the public contract

## Page Quality Bar

A page is not complete because it exists. A useful page should include the pieces that match its type:

| Page type | Required shape |
|---|---|
| Tutorial | Product moment, exact steps, code or command, expected result, common failures, next page |
| Concept | Product scene, simple model, exact technical contract, visual flow, mistake table, next concept |
| Recipe | When to use it, files, complete snippets, expected result, verification, safe variations, reference links |
| Reference | Exact names, field tables, constraints, valid examples, invalid examples, related pages |
| Proof | Claim category, measured job, boundary, non-claims, comparison rules, objection handling |
| Changelog | Date, customer category, visible change, customer impact, changed-page links |

## Changelog Rules

The rendered changelog is for customer-visible updates. It should say what changed, why a reader should care, and which pages changed.

Do not put repo chores, validation mechanics, branch details, or unpublished implementation notes into the public changelog.

## Required Checks

Run the full gate before committing:

```bash
npm run docs:generate
npm run docs:check
npm run docs:mint
git diff --check
```

If `docs:generate` changes `docs.json`, `llms.txt`, `theme.css`, or `theme.js`, include those generated outputs in the same commit.

## Commit Shape

Keep commits scoped:

- One docs content wave per commit.
- One validation or CI gate per commit.
- One plan/tracking update per corresponding plan commit when work is tracked outside this repo.

Do not mix unrelated copy, style, validation, and launch wiring in one commit unless the change cannot work without all of them.
