import { existsSync, readFileSync } from 'node:fs';
import { dirname, normalize, relative, sep } from 'node:path';

const manifest = JSON.parse(readFileSync('docs.manifest.json', 'utf8'));
const sourceMap = JSON.parse(readFileSync('source-map.json', 'utf8'));
const examples = JSON.parse(readFileSync('cookbook-examples.json', 'utf8'));
const boundarySchema = JSON.parse(readFileSync('reference/package-boundary.schema.json', 'utf8'));
const pageRoutes = new Set(manifest.pages.map((page) => page.route));
const cookbookRoutes = new Set(
  manifest.pages
    .filter(
      (page) =>
        page.diataxis === 'cookbook' &&
        page.route !== 'runtime-kit/cookbook/index',
    )
    .map((page) => page.route),
);
const sourcePages = new Map(sourceMap.pages.map((page) => [page.route, page]));
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`${path}: invalid JSON: ${error.message}`);
    return null;
  }
}

function isInside(base, candidate) {
  const rel = relative(base, candidate);
  return rel === '' || (!rel.startsWith('..') && !rel.includes(`..${sep}`));
}

function getPath(value, parts) {
  return parts.reduce((current, part) => {
    if (!current || typeof current !== 'object') return undefined;
    return current[part];
  }, value);
}

function ensureString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    fail(`${label} must be a non-empty string`);
    return false;
  }
  return true;
}

function validateMethods(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${label} must be a non-empty methods array`);
    return;
  }
  for (const [index, method] of value.entries()) {
    if (!method || typeof method !== 'object') {
      fail(`${label}[${index}] must be an object`);
      continue;
    }
    ensureString(method.name, `${label}[${index}].name`);
  }
}

function validatePackageBoundary(path) {
  const boundary = readJson(path);
  if (!boundary) return;

  for (const field of boundarySchema.topLevel.required) {
    if (!Object.hasOwn(boundary, field)) {
      fail(`${path}: missing top-level field ${field}`);
    }
  }
  for (const field of Object.keys(boundary)) {
    if (!boundarySchema.topLevel.allowed.includes(field)) {
      fail(`${path}: unknown top-level field ${field}`);
    }
  }
  ensureString(boundary.package, `${path}: package`);
  if (!Array.isArray(boundary.things)) {
    fail(`${path}: things must be an array`);
    return;
  }

  const packageDir = dirname(path);
  for (const [index, thing] of boundary.things.entries()) {
    const label = `${path}: things[${index}]`;
    if (!thing || typeof thing !== 'object') {
      fail(`${label} must be an object`);
      continue;
    }
    const rule = boundarySchema.thingTypes[thing.type];
    if (!rule) {
      fail(`${label} uses unknown thing type ${String(thing.type)}`);
      continue;
    }
    for (const field of rule.required) {
      if (!Object.hasOwn(thing, field)) {
        fail(`${label} missing required field ${field}`);
      }
    }

    if (rule.payloadChoices) {
      const chosen = rule.payloadChoices.filter((field) => Object.hasOwn(thing, field));
      if (chosen.length !== 1) {
        fail(`${label} must choose exactly one payload action`);
      }
    }

    for (const field of rule.pathFields ?? []) {
      const target = getPath(thing, field.split('.'));
      validatePackagePath(packageDir, target, `${label}.${field}`);
    }

    for (const choice of rule.pathChoices ?? []) {
      const target = getPath(thing, choice);
      if (target !== undefined) {
        validatePackagePath(packageDir, target, `${label}.${choice.join('.')}`);
      }
    }

    for (const field of rule.methodFields ?? []) {
      validateMethods(getPath(thing, field.split('.')), `${label}.${field}`);
    }
  }
}

function validatePackagePath(packageDir, target, label) {
  if (!ensureString(target, label)) return;
  const normalized = normalize(`${packageDir}/${target}`);
  if (!isInside(packageDir, normalized)) {
    fail(`${label} escapes the package folder`);
    return;
  }
  if (!existsSync(normalized)) {
    fail(`${label} points at missing file ${target}`);
  }
}

if (examples.version !== 1 || !Array.isArray(examples.examples)) {
  fail('cookbook-examples.json must have version 1 and an examples array');
}

const seenIds = new Set();
const seenRoutes = new Set();
for (const example of examples.examples ?? []) {
  if (!example || typeof example !== 'object') {
    fail('cookbook-examples.json examples must be objects');
    continue;
  }
  if (!ensureString(example.id, 'example.id')) continue;
  if (seenIds.has(example.id)) {
    fail(`duplicate cookbook example id ${example.id}`);
  }
  seenIds.add(example.id);

  if (!ensureString(example.route, `${example.id}.route`)) continue;
  seenRoutes.add(example.route);
  if (!pageRoutes.has(example.route)) {
    fail(`${example.id}: route ${example.route} is not in docs.manifest.json`);
  }

  const pagePath = `${example.route}.mdx`;
  if (!existsSync(pagePath)) {
    fail(`${example.id}: page file ${pagePath} is missing`);
    continue;
  }
  const pageBody = readFileSync(pagePath, 'utf8');

  if (!Array.isArray(example.snippets) || example.snippets.length === 0) {
    fail(`${example.id}: needs at least one snippet`);
  }
  for (const snippet of example.snippets ?? []) {
    if (!snippet || typeof snippet !== 'object' || !ensureString(snippet.file, `${example.id}.snippet.file`)) {
      continue;
    }
    if (!existsSync(snippet.file)) {
      fail(`${example.id}: snippet file ${snippet.file} is missing`);
      continue;
    }
    const snippetBody = readFileSync(snippet.file, 'utf8').trim();
    if (!pageBody.includes(snippetBody)) {
      fail(`${pagePath}: missing exact snippet from ${snippet.file}`);
    }
  }

  if (example.packageBoundary) {
    if (!existsSync(example.packageBoundary)) {
      fail(`${example.id}: packageBoundary ${example.packageBoundary} is missing`);
    } else {
      validatePackageBoundary(example.packageBoundary);
    }
  }

  const sourcePage = sourcePages.get(example.route);
  for (const sourceId of example.sourceIds ?? []) {
    if (!sourcePage?.sourceIds?.includes(sourceId)) {
      fail(`${example.route}: source-map.json missing source ${sourceId}`);
    }
  }
}

for (const route of cookbookRoutes) {
  if (!seenRoutes.has(route)) {
    fail(`cookbook route ${route} has no cookbook-examples.json entry`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('cookbook examples ok');
