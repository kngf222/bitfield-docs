import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const textExtensions = new Set([
  '.css',
  '.bin',
  '.js',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.svg',
  '.txt',
  '.yml',
  '.yaml',
]);

const ignoredDirectories = new Set([
  '.git',
  'node_modules',
]);

const ignoredFiles = new Set([
  'package-lock.json',
]);

function workflowExampleAllowlist() {
  if (!existsSync('workflow-examples.json')) return new Set();
  const examples = JSON.parse(readFileSync('workflow-examples.json', 'utf8'));
  const sourcePathToken = ['source', '_path'].join('');
  const allowed = new Set(['reference/package-boundary.schema.json']);
  for (const example of examples.examples ?? []) {
    if (!example.packageBoundary || !existsSync(example.packageBoundary)) {
      continue;
    }
    const packageBoundary = readFileSync(example.packageBoundary, 'utf8');
    if (!packageBoundary.includes(sourcePathToken)) {
      continue;
    }
    allowed.add(example.packageBoundary);
    if (example.route) {
      allowed.add(`${example.route}.mdx`);
    }
  }
  return allowed;
}

const sourcePathAllowedFiles = new Set([
  'reference/package-boundary.mdx',
  'runtime-kit/package-to-screen.mdx',
  'runtime-kit/packages.mdx',
  ...workflowExampleAllowlist(),
]);
const validatorSelfAllowedFiles = new Set(['scripts/validate-public-boundary.mjs']);

const banned = [
  { parts: ['/', 'Users', '/'] },
  { parts: ['.', 'claude'] },
  { parts: ['.', 'agents'] },
  { parts: ['Arch', 'itect'] },
  { parts: ['Mint', ' Starter Kit'] },
  { parts: ['star', 'ter', '.', 'mintlify', '.', 'com'] },
  { parts: ['hi', '@', 'mintlify', '.', 'com'] },
  { parts: ['dash', 'board', '.', 'mintlify', '.', 'com'] },
  { parts: ['open', ' source'] },
  { parts: ['open', '-source'] },
  { parts: ['MIT', ' License'] },
  { parts: ['Apache', ' License'] },
  { parts: ['G', 'P', 'L'] },
  { parts: ['A', 'G', 'P', 'L'] },
  { parts: ['TO', 'DO'] },
  { parts: ['M', 'VP'] },
  { parts: ['temp', 'orary'] },
  { parts: ['for ', 'now'] },
  {
    parts: ['source', '_path'],
    allowedFiles: sourcePathAllowedFiles,
  },
  { parts: ['source', '_repo'] },
  { parts: ['Ceiling you have not hit yet'], allowedFiles: validatorSelfAllowedFiles },
  { parts: ['plain English'], allowedFiles: validatorSelfAllowedFiles },
  { parts: ['Plain English'], allowedFiles: validatorSelfAllowedFiles },
  { parts: ['internal docs ID'], allowedFiles: validatorSelfAllowedFiles },
  { parts: ['internals'], allowedFiles: validatorSelfAllowedFiles },
  { parts: ['raw internal'], allowedFiles: validatorSelfAllowedFiles },
  { parts: ['proprietary internals'], allowedFiles: validatorSelfAllowedFiles },
  { parts: ['private internals'], allowedFiles: validatorSelfAllowedFiles },
  { parts: ['slot internals'], allowedFiles: validatorSelfAllowedFiles },
].map((rule) => ({
  pattern: rule.parts.join(''),
  allowedFiles: rule.allowedFiles ?? new Set(),
}));

function extensionOf(path) {
  const index = path.lastIndexOf('.');
  return index === -1 ? '' : path.slice(index);
}

function walk(directory, files = []) {
  for (const name of readdirSync(directory)) {
    if (ignoredDirectories.has(name)) continue;
    if (ignoredFiles.has(name)) continue;
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, files);
      continue;
    }
    if (textExtensions.has(extensionOf(name))) {
      files.push(path);
    }
  }
  return files;
}

const failures = [];

for (const file of walk(root)) {
  const rel = relative(root, file);
  const body = readFileSync(file, 'utf8');
  for (const rule of banned) {
    if (body.includes(rule.pattern) && !rule.allowedFiles.has(rel)) {
      failures.push(`${rel}: contains blocked public-boundary phrase: ${rule.pattern}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('public boundary ok');
