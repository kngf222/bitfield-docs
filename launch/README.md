# Launch Runbook

This folder owns the docs launch wiring runbook for `docs.bitfield.so`.

The public docs are served by Mintlify from the GitHub repository `kngf222/bitfield-docs` on branch `main`.

Reference docs checked on 2026-05-09:

- Mintlify GitHub deployment: <https://www.mintlify.com/docs/deploy/github>
- Mintlify deployments: <https://www.mintlify.com/docs/deploy/deployments>
- Mintlify custom domain: <https://www.mintlify.com/docs/customize/custom-domain>

## Launch Invariants

| Item | Required value |
|---|---|
| GitHub repository | `kngf222/bitfield-docs` |
| Deploy branch | `main` |
| Docs root | Repository root |
| Public domain | `docs.bitfield.so` |
| Canonical URL | `https://docs.bitfield.so` |
| Local validation gate | `npm run docs:generate && npm run docs:check && npm run docs:mint && git diff --check` |
| CI gate | `.github/workflows/docs.yml` must pass on `main` |

## Preflight

Run this before changing deployment settings:

```bash
npm ci
npm run docs:generate
npm run docs:check
npm run docs:mint
git diff --exit-code -- docs.json llms.txt
git diff --check
```

Expected result: every command exits cleanly. Mintlify may warn that the fallback primary color meets AA but not AAA contrast; that warning is already known and does not block launch.

## GitHub App Wiring

1. Open the Mintlify project for Bitfield docs.
2. Open Git settings.
3. Connect GitHub repository `kngf222/bitfield-docs`.
4. Set branch to `main`.
5. Set docs directory to the repository root.
6. Install the Mintlify GitHub App with access limited to `kngf222/bitfield-docs`.
7. Push a harmless docs-only commit or rerun the latest deployment.
8. Confirm the deployment starts from the latest `main` commit.

Expected result: pushing to `main` triggers a Mintlify deployment and pull requests receive preview builds.

## Domain Wiring

1. In Mintlify custom domain settings, add `docs.bitfield.so`.
2. Add the two verification `TXT` records Mintlify shows for the domain.
3. Wait until Mintlify marks both verification records as verified.
4. In Namecheap DNS, set:

```text
Type: CNAME
Host: docs
Value: cname.mintlify.builders
TTL: Automatic
```

5. Keep `docs.bitfield.so` free of competing `A`, `AAAA`, or second `CNAME` records.
6. Wait for DNS propagation and TLS provisioning.
7. Confirm `https://docs.bitfield.so` loads the Mintlify site.

Expected result: `docs.bitfield.so` resolves through Mintlify, HTTPS works, and the browser does not warn about certificate mismatch.

## DNS And TLS Notes

Mintlify's current custom-domain docs say DNS propagation often takes 1-24 hours and can take up to 48 hours. HTTPS becomes available after Mintlify provisions TLS, usually within a few hours after DNS is correct, with rare cases taking up to 24 hours.

If the domain is still pending:

- Confirm the two `TXT` records match exactly.
- Confirm the `docs` CNAME points to `cname.mintlify.builders`.
- Confirm there is no competing `A`, `AAAA`, or second `CNAME` for `docs`.
- Retry validation from Mintlify only after DNS records are correct.

## Post-Launch Verification

Check these URLs:

```text
https://docs.bitfield.so
https://docs.bitfield.so/start/quickstart
https://docs.bitfield.so/runtime-kit/package-to-screen
https://docs.bitfield.so/reference/runtime-kit-api
https://docs.bitfield.so/proof/how-bitfield-is-fast
https://docs.bitfield.so/llms.txt
```

Expected result: every URL returns the Bitfield docs site over HTTPS.

## Rollback

If a deployment is bad but the domain and TLS are healthy:

1. Revert the bad docs commit on `main`.
2. Push the revert.
3. Confirm GitHub CI passes.
4. Confirm Mintlify deploys the reverted commit.

If the domain is bad:

1. Do not change docs content.
2. Fix DNS records first.
3. Wait for Mintlify domain status to verify.
4. Recheck HTTPS.

The domain problem and the docs content problem are separate. Do not mix them in one fix.
