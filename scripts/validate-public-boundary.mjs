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
  ['/', 'Users', '/'],
  ['.', 'claude'],
  ['.', 'agents'],
  ['Arch', 'itect'],
  ['Mint', ' Starter Kit'],
  ['star', 'ter', '.', 'mintlify', '.', 'com'],
  ['hi', '@', 'mintlify', '.', 'com'],
  ['dash', 'board', '.', 'mintlify', '.', 'com'],
  ['open', ' source'],
  ['open', '-source'],
  ['MIT', ' License'],
  ['Apache', ' License'],
  ['G', 'P', 'L'],
  ['A', 'G', 'P', 'L'],
  ['TO', 'DO'],
  ['M', 'VP'],
  ['temp', 'orary'],
  ['for ', 'now'],
  ['source', '_path'],
  ['source', '_repo'],
].map((parts) => parts.join(''));

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
  for (const pattern of banned) {
    if (body.includes(pattern)) {
      failures.push(`${rel}: contains blocked public-boundary phrase: ${pattern}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('public boundary ok');
