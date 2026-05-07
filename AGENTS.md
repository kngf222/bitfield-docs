# Bitfield public docs rules

This repository contains customer-facing Bitfield documentation only.

## Public boundary

- Do not publish local machine paths, private repo names, private task plans, raw research notes, raw benchmark logs, account-portal implementation details, payment-provider wiring, or unpublished APIs.
- Do not imply that Bitfield software, designs, benchmarks, or product materials may be copied, forked, redistributed, or reused outside the access granted by Bitfield.
- Do not copy internal engineering docs into this repo. Rewrite public explanations from the customer's point of view.
- Do not add vendor template content, vendor support links, sample APIs, or placeholder pages.

## Public terminology

- Use `Bitfield` for the product.
- Use `Runtime Kit` for the customer-facing package/runtime layer.
- Use `active device` for a device, environment, or runtime identity activated with a Bitfield key and not revoked or replaced.
- Use `key` for the customer access path.
- Use `account portal` for billing, activation, cancellation, replacement, and key access.

## Writing style

- Plain English first. Technical detail second.
- Define terms in the same paragraph where they appear.
- Use short complete sentences.
- Make every serious speed claim name the measured category and the non-claim.
- Keep docs portable: content lives in MDX and shared CSS classes, not inline styling.

## Required checks

Run these before committing:

```bash
npm run docs:generate
npm run docs:check
```
