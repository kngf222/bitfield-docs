import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const manifest = JSON.parse(readFileSync('docs.manifest.json', 'utf8'));
const claimLedger = JSON.parse(readFileSync('claim-ledger.json', 'utf8'));
const docsJson = JSON.parse(readFileSync('docs.json', 'utf8'));
const llms = readFileSync('llms.txt', 'utf8');

const pageRoutes = new Set(manifest.pages.map((page) => page.route));
const failures = [];

for (const page of manifest.pages) {
  const file = `${page.route}.mdx`;
  if (!existsSync(file)) {
    failures.push(`Missing page file: ${file}`);
  }
  if (!page.title || !page.description || !page.summary || !page.diataxis) {
    failures.push(`Page metadata incomplete: ${page.route}`);
  }
  if (!llms.includes(`[${page.title}](${page.route})`)) {
    failures.push(`llms.txt missing page: ${page.route}`);
  }
}

for (const tab of manifest.navigation) {
  for (const group of tab.groups) {
    for (const route of group.pages) {
      if (!pageRoutes.has(route)) {
        failures.push(`Navigation references unknown page: ${route}`);
      }
    }
  }
}

const docsPages = new Set(
  docsJson.navigation.tabs.flatMap((tab) =>
    tab.groups.flatMap((group) => group.pages),
  ),
);

for (const route of pageRoutes) {
  if (!docsPages.has(route)) {
    failures.push(`docs.json navigation missing page: ${route}`);
  }
}

for (const claim of claimLedger.claims) {
  for (const route of claim.publicUse) {
    if (!pageRoutes.has(route)) {
      failures.push(`Claim ${claim.id} references unknown public page: ${route}`);
    }
  }
  if (!claim.notClaiming?.length) {
    failures.push(`Claim ${claim.id} needs explicit non-claims`);
  }
}

const regenerated = spawnSync(process.execPath, ['scripts/generate-docs.mjs'], {
  encoding: 'utf8',
});
if (regenerated.status !== 0) {
  failures.push(regenerated.stderr || regenerated.stdout || 'docs generation failed');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('docs graph ok');
