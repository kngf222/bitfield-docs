import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const textExtensions = new Set([
  '.css',
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
    allowedFiles: new Set([
      'reference/package-boundary.mdx',
      'workflows/package-owned-file.mdx',
      'workflows/callable-package-slot.mdx',
    ]),
  },
  { parts: ['source', '_repo'] },
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
