import { readdir, stat, unlink } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const outDir = process.env.REVIEW_SCREENSHOT_DIR || 'review-screenshots';
const maxWidth = Number(process.env.REVIEW_PREVIEW_WIDTH || 1600);
const quality = Number(process.env.REVIEW_PREVIEW_QUALITY || 80);

const files = (await readdir(outDir)).filter((file) => extname(file).toLowerCase() === '.png');
let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const input = join(outDir, file);
  const output = join(outDir, `${basename(file, '.png')}.webp`);
  const before = (await stat(input)).size;

  await sharp(input)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(output);

  const after = (await stat(output)).size;
  totalBefore += before;
  totalAfter += after;
  await unlink(input);

  console.log(`${file}: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
}

if (files.length === 0) {
  throw new Error(`No PNG review screenshots found in ${outDir}.`);
}

console.log(
  `Compressed ${files.length} review screenshots: ${(totalBefore / 1024 / 1024).toFixed(1)} MB -> ${(totalAfter / 1024 / 1024).toFixed(1)} MB`,
);
