# Build Without Tangled Code Docs

This folder owns the Runtime Kit pages that teach the translation from traditional coupled application code into Bitfield package boundaries.

## Files

- `index.mdx` introduces the translation: shared product fact, prepared input, target request, private UI state, and package-owned bytes.
- `share-state-between-packages.mdx` explains shared product facts using the selected-file shape.
- `read-data-another-package-prepared.mdx` explains prepared inputs and why consumers do not parse producer package files.
- `ask-another-package-to-do-work.mdx` explains named target requests instead of direct implementation calls.
- `keep-private-ui-state-private.mdx` separates private UI state from product coordination state.
- `store-files-inside-a-package.mdx` explains package-owned bytes and consumer boundaries.
- `let-many-packages-work-together.mdx` shows a multi-package cooperation chain.
- `build-a-file-preview-flow.mdx` is a source-grounded case study for file, preview, help, keyboard, notification, and UI-private boundaries.
- `rules-for-ai-agents.mdx` gives prompt and review rules for agents that default to traditional app architecture.

## Standard

Every page in this folder must show the traditional instinct and the Bitfield replacement. The reader should be able to translate a direct import, shared store, package-file read, direct implementation call, or over-globalized UI state into the public Runtime Kit shape.

React examples are allowed only as adapter examples. The architecture must stay platform-neutral.

Case studies must not be padded overviews. A case study must follow a realistic product flow end to end: traditional implementation, Bitfield translation, public handles, data-flow map, package/file boundary, agent mistakes, and review checks.

## Boundary

These pages may publish public Runtime Kit imports, package boundary vocabulary, public input names, public target-request shapes, and public-safe cooperation examples.

These pages must not publish private local paths, private agent instructions, hidden build instructions, low-level storage mechanics, or private package implementation details.
