import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_ROOT = path.join(ROOT, 'src');
const TARGET = path.join(SRC_ROOT, 'ui/icons/runtime-icons.generated');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function importPathFor(file) {
  let relative = path.relative(path.dirname(file), TARGET).replaceAll('\\', '/');
  if (!relative.startsWith('.')) relative = './' + relative;
  return relative;
}

let changed = 0;
let remaining = 0;

for (const file of await walk(SRC_ROOT)) {
  if (file.endsWith('runtime-icons.generated.tsx')) continue;
  const text = await readFile(file, 'utf8');
  let next = text;

  if (/from\s*['"]lucide-react['"]/.test(next)) {
    next = next.replace(
      /from\s*['"]lucide-react['"]/g,
      "from '" + importPathFor(file) + "'",
    );
  }

  next = next.replace(/\bLucideIcon\b/g, 'UiIconComponent');

  if (next !== text) {
    await writeFile(file, next, 'utf8');
    changed += 1;
  }
}

for (const file of await walk(SRC_ROOT)) {
  const text = await readFile(file, 'utf8');
  if (/from\s*['"]lucide-react['"]/.test(text) || /\bLucideIcon\b/.test(text)) {
    console.error('Remaining Lucide Runtime contract: ' + path.relative(ROOT, file));
    remaining += 1;
  }
}

console.log('Migrated Runtime icon contracts: ' + changed + ' files.');
if (remaining) process.exitCode = 1;
