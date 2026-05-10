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
const knownPageClasses = new Set([
  'runtime-kit-tutorial',
  'runtime-kit-concept',
  'runtime-kit-recipe-index',
  'runtime-kit-recipe',
  'runtime-kit-reference',
  'runtime-kit-ai-agent',
  'runtime-kit-operations',
  'runtime-kit-boundary-translation',
  'runtime-kit-boundary-case-study',
  'build-curriculum',
  'activation-lifecycle',
  'proof-stack',
  'start-onboarding',
  'concept-curriculum',
  'public-changelog',
  'public-manifesto',
]);

function hasAny(body, needles) {
  return needles.some((needle) => body.includes(needle));
}

function requireIncludes(route, body, requirements, output = failures) {
  for (const [label, needles] of requirements) {
    const list = Array.isArray(needles) ? needles : [needles];
    if (!hasAny(body, list)) {
      output.push(`${route}: missing ${label}`);
    }
  }
}

function countMatches(body, pattern) {
  return [...body.matchAll(pattern)].length;
}

function validateDepthContract(page, body, sourcePage, output = failures) {
  if (!page.pageClass) return;
  if (!knownPageClasses.has(page.pageClass)) {
    output.push(`${page.route}: unknown pageClass ${page.pageClass}`);
    return;
  }

  if (!sourcePage?.sourceIds?.length) {
    output.push(`${page.route}: depth gate requires source-map sourceIds`);
  }

  if (page.pageClass === 'runtime-kit-recipe') {
    requireIncludes(page.route, body, [
      ['recipe product/build section', '## What you will build'],
      ['source-owned code snippet', '```'],
      ['verification section', '## Verify'],
      ['common failures section', '## Common failures'],
      ['next links section', '## Next'],
      ['reference link', '/reference/'],
    ], output);
    if (!sourcePage?.sourceIds?.includes('runtime-kit-public-cookbook-examples')) {
      output.push(`${page.route}: recipe must source-map to runtime-kit-public-cookbook-examples`);
    }
    return;
  }

  if (page.pageClass === 'runtime-kit-recipe-index') {
    requireIncludes(page.route, body, [
      ['recipe flow visual', 'className="bf-flow"'],
      ['recipe contract section', ['## Runtime Kit Cookbook contract for AI agents', '## Generated-code contract']],
      ['job route map', '## Choose by job'],
      ['future whole-product Cookbook boundary', 'future whole-product Bitfield Cookbook'],
    ], output);
    return;
  }

  if (page.pageClass === 'runtime-kit-concept') {
    requireIncludes(page.route, body, [
      ['product scene', 'Product scene:'],
      ['visual flow or structured map', ['className="bf-flow"', 'className="bf-lane-map"']],
      ['anti-pattern or bad-shape section', ['Anti-pattern', '## What this prevents']],
      ['tutorial link', '/runtime-kit/package-to-screen'],
      ['recipe link', '/runtime-kit/cookbook/'],
      ['reference link', '/reference/'],
    ], output);
    return;
  }

  if (page.pageClass === 'runtime-kit-reference') {
    requireIncludes(page.route, body, [
      ['field or parameter table', '| Field |'],
      ['valid example', ['Complete valid example', 'Complete valid package boundary', 'Valid slot:', 'Valid package-owned file:']],
      ['invalid example', ['Invalid example', 'Invalid record:', 'Invalid package-owned file:', 'Invalid slot:']],
      ['public boundary section', ['## Boundary summary', '## Public versus non-public']],
      ['related links section', ['## Related pages', '## Related pages']],
    ], output);
    return;
  }

  if (page.pageClass === 'runtime-kit-tutorial') {
    requireIncludes(page.route, body, [
      ['visual flow', 'className="bf-flow"'],
      ['expected result', 'Expected result:'],
      ['anti-pattern section', '## What not to do'],
      ['next links section', '## Where to go next'],
    ], output);
    return;
  }

  if (page.pageClass === 'runtime-kit-ai-agent') {
    requireIncludes(page.route, body, [
      ['prompt packs', '## Prompt packs'],
      ['bad-output corrections', '## Bad output and corrected output'],
      ['full review map', '## Full Runtime Kit review map'],
      ['public import rails', 'Use only the public Runtime Kit surface'],
    ], output);
    return;
  }

  if (page.pageClass === 'runtime-kit-operations') {
    requireIncludes(page.route, body, [
      ['troubleshooting visual', 'className="bf-flow"'],
      ['symptom table', '## Start with the symptom'],
      ['verification path', ['## Verify', 'The component renders real data']],
      ['safe local state boundary', 'Do not copy one device'],
    ], output);
    return;
  }

  if (page.pageClass === 'runtime-kit-boundary-translation') {
    requireIncludes(page.route, body, [
      ['traditional shape', ['Traditional app shape', 'Traditional:', 'Traditional mistake', 'traditional app-code instinct']],
      ['Bitfield shape', ['Bitfield shape', 'Bitfield:', 'Bitfield path']],
      ['code or structured example', ['```', '|']],
      ['anti-pattern or prevention section', ['## What this prevents', '## Common mistake', '## Common failures', '## Bad output and corrected output']],
      ['adapter-neutral language', ['React is only the adapter', 'React is one adapter', 'any shell', 'future adapters']],
      ['scenario section', ['## Four ', '## Larger chain', '## The story traditional code usually writes', '## Classification protocol']],
      ['review language', ['## Review checklist', 'checklist', '## Consumer boundary checklist', '## Multi-package review checklist']],
      ['next links section', '## Next'],
      ['Runtime Kit or reference link', ['/runtime-kit/', '/reference/']],
    ], output);
    if (countMatches(body, /Traditional (shape|mistake|answer|addition|over-globalized|under-shared|app-code instinct)|Bad:/g) < 3) {
      output.push(`${page.route}: boundary translation page needs at least three traditional/bad examples`);
    }
    if (countMatches(body, /Bitfield (replacement|answer|addition|shape)|Better answer|Correct:/g) < 3) {
      output.push(`${page.route}: boundary translation page needs at least three Bitfield/correct replacements`);
    }
    if (!sourcePage?.sourceIds?.includes('runtime-kit-public-package-cooperation')) {
      output.push(`${page.route}: boundary translation page must source-map to runtime-kit-public-package-cooperation`);
    }
    return;
  }

  if (page.pageClass === 'runtime-kit-boundary-case-study') {
    requireIncludes(page.route, body, [
      ['source facts section', '## Source facts this case uses'],
      ['traditional implementation', '## Traditional implementation'],
      ['Bitfield translation', '## Bitfield translation'],
      ['public handles table', '## Public handles'],
      ['data-flow map', '## Data-flow map'],
      ['file boundary section', '## File-by-file public boundary'],
      ['generated-code mistakes section', ['## Agent mistakes to reject', '## Generated-code mistakes to reject']],
      ['review checklist', '## Review checklist'],
      ['adapter-neutral language', ['React is one adapter', 'future SDK', 'native shell']],
      ['next links section', '## Next'],
    ], output);
    if (countMatches(body, /selected-file|current-project|project-preview-surface|getting-started-help|selected-agent\.update|notification-mode\.update/g) < 8) {
      output.push(`${page.route}: case study needs repeated concrete public handles`);
    }
    if (countMatches(body, /import .*\\.\\.|store|service|private|implementation/g) < 5) {
      output.push(`${page.route}: case study needs concrete traditional coupling examples`);
    }
    if (!sourcePage?.sourceIds?.includes('runtime-kit-public-package-cooperation')) {
      output.push(`${page.route}: boundary case study must source-map to runtime-kit-public-package-cooperation`);
    }
    return;
  }

  if (page.pageClass === 'build-curriculum') {
    requireIncludes(page.route, body, [
      ['build visual flow', 'className="bf-flow"'],
      ['expected result', 'Expected result:'],
      ['common failures or mistakes', ['## Common failures', '## Common build mistakes', '## What this prevents']],
      ['next-step section', '## Next'],
      ['Runtime Kit or reference link', ['/runtime-kit/', '/reference/']],
    ], output);
    return;
  }

  if (page.pageClass === 'activation-lifecycle') {
    requireIncludes(page.route, body, [
      ['activation visual flow', 'className="bf-flow"'],
      ['expected result', 'Expected result:'],
      ['common failures section', '## Common failures'],
      ['next-step section', '## Next'],
      ['account or legal route', ['account.bitfield.so', 'https://bitfield.so/terms', 'mailto:support@bitfield.so']],
    ], output);
    return;
  }

  if (page.pageClass === 'proof-stack') {
    requireIncludes(page.route, body, [
      ['proof visual flow', 'className="bf-flow"'],
      ['expected result', 'Expected result:'],
      ['claim category language', ['category', 'Category', 'measured job']],
      ['non-claim or boundary language', ['non-claim', 'non-claims', 'not claim', 'not claiming', 'excluded work', 'Boundary']],
      ['common failures section', '## Common failures'],
      ['next-step section', '## Next'],
      ['claim/proof link', ['/reference/claim-ledger', '/proof/benchmark-ledger', '/proof/methodology']],
    ], output);
    return;
  }

  if (page.pageClass === 'start-onboarding') {
    requireIncludes(page.route, body, [
      ['start visual flow', 'className="bf-flow"'],
      ['expected result', 'Expected result:'],
      ['step-by-step section', ['## 1.', '## Choose your path']],
      ['failure or wrong-turn section', ['## Common failures', '## Common first wrong turns']],
      ['next-step section', '## Next'],
      ['Runtime Kit link', '/runtime-kit/'],
      ['account or activation link', ['/start/get-your-key', 'account.bitfield.so', '/activation/', '/concepts/active-devices']],
    ], output);
    return;
  }

  if (page.pageClass === 'concept-curriculum') {
    requireIncludes(page.route, body, [
      ['product scene', 'Product scene:'],
      ['concept visual flow', 'className="bf-flow"'],
      ['expected result', 'Expected result:'],
      ['mistakes or confusion section', ['## Common mistakes', '## Common confusion', '## What this prevents']],
      ['next-step section', '## Next'],
      ['Runtime Kit, proof, activation, or reference link', ['/runtime-kit/', '/proof/', '/activation/', '/reference/', '/start/']],
    ], output);
    return;
  }

  if (page.pageClass === 'public-changelog') {
    requireIncludes(page.route, body, [
      ['changelog visual flow', 'className="bf-flow"'],
      ['expected result', 'Expected result:'],
      ['how-to-read section', '## How to read this changelog'],
      ['latest changes table', '## Latest customer-visible changes'],
      ['public categories', ['Runtime Kit', 'Build', 'Account', 'Proof', 'Docs', 'Start']],
      ['changed page links', ['/runtime-kit/', '/build-your-own-surface/', '/activation/', '/proof/', '/start/']],
      ['off-page boundary', '## What stays off this page'],
      ['next-step section', '## Next'],
    ], output);
    return;
  }

  if (page.pageClass === 'public-manifesto') {
    requireIncludes(page.route, body, [
      ['manifesto wrapper', 'bf-manifesto'],
      ['manifesto body', 'bf-manifesto-body'],
      ['signature block', 'bf-manifesto-signature'],
      ['founder title', 'Founder of Bitfield'],
      ['core thesis', 'All future software will run on Bitfield'],
      ['curiosity thesis', 'curiosity are allowed to live and grow forever'],
    ], output);
  }
}

const depthGateFixtureFailures = [];
validateDepthContract(
  {
    route: 'scripts/fixtures/docs-depth/shallow-recipe',
    pageClass: 'runtime-kit-recipe',
  },
  readFileSync('scripts/fixtures/docs-depth/shallow-recipe.mdx.fixture', 'utf8'),
  { sourceIds: [] },
  depthGateFixtureFailures,
);
if (
  !depthGateFixtureFailures.some((failure) => failure.includes('missing common failures section')) ||
  !depthGateFixtureFailures.some((failure) => failure.includes('recipe must source-map'))
) {
  failures.push('docs depth fixture failed to prove shallow recipe rejection');
}

for (const page of manifest.pages) {
  const file = `${page.route}.mdx`;
  let body = '';
  if (!existsSync(file)) {
    failures.push(`Missing page file: ${file}`);
  } else {
    body = readFileSync(file, 'utf8');
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
  if (body) {
    validateDepthContract(page, body, sourcePage);
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
