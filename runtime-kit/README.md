# Runtime Kit Docs

This folder owns the public Runtime Kit documentation pages rendered by Mintlify.

## Files

- `javascript.mdx` explains the overall public Runtime Kit map, first-feature shape, terms, mistakes, and routing.
- `package-to-screen.mdx` walks a complete first feature from package boundary to React surface, target request, verification, and failure checks.
- `placeable-surfaces.mdx` explains the generic surface descriptor primitive and visual product-shell flow.
- `use-bitfield-data.mdx` documents the public React read shape.
- `send-request.mdx` documents target requests and reply bytes.
- `packages.mdx` documents package boundary concepts and thing types.
- `local-state.mdx` documents customer-visible local state.
- `ai-build-rules.mdx` gives AI-agent-safe Runtime Kit build rules.
- `troubleshooting.mdx` maps symptoms to the public Runtime Kit link that failed, with first-five-minute triage, verification checks, and support-safe escalation.

## Page Standard

Runtime Kit pages must be useful to a human developer and to an AI agent reading the docs before editing code. Each guide should name the product moment, public boundary, files or calls the reader owns, expected result, common failures, and next link.

Cookbook-adjacent pages must avoid loose snippets. A recipe needs a scene, exact files, public contract, verification point, extension path, and boundary warnings.

## Boundary

These pages may explain public imports, package boundary files, package sets, local state folder meanings, prepared inputs, target names, payloads, reply bytes, and public mistakes.

These pages must not publish private Runtime Kit wiring, unpublished imports, exact proprietary storage layouts, private machine paths beyond customer-visible `~/.bitfield` meanings, hidden prompts, or implementation secrets.
