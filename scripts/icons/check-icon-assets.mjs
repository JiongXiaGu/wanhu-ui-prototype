import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ICON_SOURCE_NAMES } from './icon-source-list.mjs';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'public/assets/ui/icons/icon-manifest.json');
const GENERATED_TS_PATH = path.join(ROOT, 'src/ui/icons/icon-manifest.generated.ts');
const RUNTIME_TS_PATH = path.join(ROOT, 'src/ui/icons/runtime-icons.generated.tsx');
const LICENSE_PATH = path.join(ROOT, 'AssetsSource/UI/Icons/LUCIDE_LICENSE.txt');

const EXPECTED_SIZE = 64;
const EXPECTED_STROKE = 1.7;
const EXPECTED_SOURCE_VERSION = '1.47.0';

function toAssetId(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Za-z])(\d)/g, '$1-$2')
    .replace(/(\d)([A-Za-z])/g, '$1-$2')
    .toLowerCase();
}

const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
const generatedTs = await readFile(GENERATED_TS_PATH, 'utf8');
const runtimeTs = await readFile(RUNTIME_TS_PATH, 'utf8');
const expected = ICON_SOURCE_NAMES.map((sourceName) => ({
  sourceName,
  id: toAssetId(sourceName),
}));

if (manifest.iconCount !== expected.length || manifest.icons.length !== expected.length) {
  throw new Error('Icon manifest count mismatch: expected ' + expected.length + ', got ' + manifest.iconCount);
}
if (manifest.canvasSize !== EXPECTED_SIZE || manifest.strokeWidth !== EXPECTED_STROKE) {
  throw new Error('Icon manifest geometry contract drifted.');
}
if (manifest.sourcePackage?.name !== 'lucide-react' || manifest.sourcePackage?.version !== EXPECTED_SOURCE_VERSION) {
  throw new Error('Icon source package contract drifted.');
}

const manifestById = new Map(manifest.icons.map((entry) => [entry.id, entry]));

for (const item of expected) {
  const entry = manifestById.get(item.id);
  if (!entry || entry.sourceName !== item.sourceName) {
    throw new Error('Missing or mismatched manifest icon: ' + item.sourceName + ' -> ' + item.id);
  }

  const svgPath = path.join(ROOT, entry.sourceSvg);
  const pngPath = path.join(ROOT, entry.png);
  await access(svgPath);
  await access(pngPath);

  const meta = await sharp(pngPath).metadata();
  if (meta.width !== EXPECTED_SIZE || meta.height !== EXPECTED_SIZE || !meta.hasAlpha) {
    throw new Error(item.id + '.png violates 64x64 RGBA runtime contract.');
  }

  if (!generatedTs.includes("'" + item.id + "': '/assets/ui/icons/" + item.id + ".png'")) {
    throw new Error('Generated UiIcon manifest TS missing: ' + item.id);
  }
  if (!runtimeTs.includes('export const ' + item.sourceName + ': UiIconComponent')) {
    throw new Error('Generated PNG component adapter missing: ' + item.sourceName);
  }
}

await access(LICENSE_PATH);

console.log(
  'UI icon asset check: PASS (' + expected.length + ' SVG Source + ' +
  expected.length + ' PNG Runtime, ' + EXPECTED_SIZE + 'x' + EXPECTED_SIZE +
  ', stroke ' + EXPECTED_STROKE + ').',
);
