import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const manifest = JSON.parse(readFileSync('docs.manifest.json', 'utf8'));
const claimLedger = JSON.parse(readFileSync('claim-ledger.json', 'utf8'));
const docsJson = JSON.parse(readFileSync('docs.json', 'utf8'));
const sourceMap = JSON.parse(readFileSync('source-map.json', 'utf8'));
const llms = readFileSync('llms.txt', 'utf8');

const pageRoutes = new Set(manifest.pages.map((page) => page.route));
const sourceIds = new Set(sourceMap.sources.map((source) => source.id));
const sourcePages = new Map(sourceMap.pages.map((page) => [page.route, page]));
const retiredClaimField = String.fromCharCode(
  112,
  108,
  97,
  105,
  110,
  69,
  110,
  103,
  108,
  105,
  115,
  104,
);
const failures = [];
const allowedClaimCategories = new Set([
  'warm-local-read',
  'content-address-lookup',
  'durable-batch-write',
  'batched-write-ceiling',
]);

for (const page of manifest.pages) {
  const file = `${page.route}.mdx`;
  if (!existsSync(file)) {
    failures.push(`Missing page file: ${file}`);
  } else {
    const body = readFileSync(file, 'utf8');
    if (/^#\s+/m.test(body)) {
      failures.push(`${file} must not declare an in-body H1; Mintlify renders page.title`);
    }
    if (body.includes('className="bf-kicker"')) {
      failures.push(`${file} must not declare an in-body bf-kicker; Mintlify renders the page context`);
    }
  }
  if (!page.title || !page.description || !page.summary || !page.diataxis) {
    failures.push(`Page metadata incomplete: ${page.route}`);
  }
  if (!llms.includes(`[${page.title}](${page.route})`)) {
    failures.push(`llms.txt missing page: ${page.route}`);
  }
  const sourcePage = sourcePages.get(page.route);
  if (!sourcePage) {
    failures.push(`source-map.json missing page: ${page.route}`);
  } else if (!sourcePage.sourceIds?.length) {
    failures.push(`source-map.json page needs sourceIds: ${page.route}`);
  } else {
    for (const sourceId of sourcePage.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        failures.push(`source-map.json page ${page.route} references unknown source: ${sourceId}`);
      }
    }
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

for (const route of sourcePages.keys()) {
  if (!pageRoutes.has(route)) {
    failures.push(`source-map.json references unknown public page: ${route}`);
  }
}

for (const source of sourceMap.sources) {
  if (!source.id || !source.kind || !source.publicUse || !source.freshness) {
    failures.push(`source-map.json source incomplete: ${source.id ?? '(missing id)'}`);
  }
}

for (const claim of claimLedger.claims) {
  if (!allowedClaimCategories.has(claim.category)) {
    failures.push(`Claim ${claim.id} uses unknown category: ${claim.category}`);
  }
  if (!Array.isArray(claim.mechanismCategories) || claim.mechanismCategories.length === 0) {
    failures.push(`Claim ${claim.id} needs mechanismCategories`);
  }
  if (claim.disclosureTier !== 'public-mechanism-category') {
    failures.push(`Claim ${claim.id} needs disclosureTier public-mechanism-category`);
  }
  if (!claim.mechanism) {
    failures.push(`Claim ${claim.id} needs mechanism text`);
  }
  if (Object.hasOwn(claim, retiredClaimField)) {
    failures.push(`Claim ${claim.id} uses retired mechanism field name`);
  }
  for (const route of claim.publicUse) {
    if (!pageRoutes.has(route)) {
      failures.push(`Claim ${claim.id} references unknown public page: ${route}`);
    }
  }
  if (!claim.notClaiming?.length) {
    failures.push(`Claim ${claim.id} needs explicit non-claims`);
  }
  if (!Array.isArray(claim.forbiddenPublicDetails) || claim.forbiddenPublicDetails.length === 0) {
    failures.push(`Claim ${claim.id} needs forbiddenPublicDetails`);
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
