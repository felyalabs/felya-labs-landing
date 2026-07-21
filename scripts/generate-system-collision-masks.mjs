import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imageRoot = path.join(repositoryRoot, 'public/assets/images/system');

const collisionSources = [
  {
    input: 'operator/paton-operator-long-mask.webp',
    output: 'operator/paton-operator-long-collision.webp',
  },
  {
    input: 'operator/paton-operator-short-mask.webp',
    output: 'operator/paton-operator-short-collision.webp',
    // The compact composition intentionally crops the source below the belt.
    clipHeight: 1260,
  },
  {
    input: 'openarm-system-blueprint-refined.webp',
    output: 'openarm-system-collision.webp',
  },
];

const alphaThreshold = 32;
const safetyRadius = 24;

function dilate(mask, width, height, radius) {
  const horizontal = new Uint8Array(mask.length);
  const output = new Uint8Array(mask.length);

  for (let y = 0; y < height; y += 1) {
    let active = 0;
    const row = y * width;
    for (let x = -radius; x < width + radius; x += 1) {
      const entering = x + radius;
      const leaving = x - radius - 1;
      if (entering >= 0 && entering < width) active += mask[row + entering];
      if (leaving >= 0 && leaving < width) active -= mask[row + leaving];
      if (x >= 0 && x < width && active > 0) horizontal[row + x] = 1;
    }
  }

  for (let x = 0; x < width; x += 1) {
    let active = 0;
    for (let y = -radius; y < height + radius; y += 1) {
      const entering = y + radius;
      const leaving = y - radius - 1;
      if (entering >= 0 && entering < height) active += horizontal[entering * width + x];
      if (leaving >= 0 && leaving < height) active -= horizontal[leaving * width + x];
      if (y >= 0 && y < height && active > 0) output[y * width + x] = 1;
    }
  }

  return output;
}

function createOrthogonalSilhouette(alpha, width, height, clipHeight = height) {
  const source = new Uint8Array(width * height);
  const rowMinimum = new Int32Array(height).fill(width);
  const rowMaximum = new Int32Array(height).fill(-1);
  const columnMinimum = new Int32Array(width).fill(height);
  const columnMaximum = new Int32Array(width).fill(-1);

  for (let y = 0; y < Math.min(height, clipHeight); y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (alpha[index] < alphaThreshold) continue;
      source[index] = 1;
      rowMinimum[y] = Math.min(rowMinimum[y], x);
      rowMaximum[y] = Math.max(rowMaximum[y], x);
      columnMinimum[x] = Math.min(columnMinimum[x], y);
      columnMaximum[x] = Math.max(columnMaximum[x], y);
    }
  }

  const silhouette = new Uint8Array(source.length);
  for (let y = 0; y < Math.min(height, clipHeight); y += 1) {
    if (rowMaximum[y] < 0) continue;
    for (let x = rowMinimum[y]; x <= rowMaximum[y]; x += 1) {
      if (columnMaximum[x] < 0) continue;
      if (y >= columnMinimum[x] && y <= columnMaximum[x]) {
        silhouette[y * width + x] = 1;
      }
    }
  }

  for (let index = 0; index < source.length; index += 1) {
    silhouette[index] ||= source[index];
  }

  return dilate(silhouette, width, height, safetyRadius);
}

async function generateCollisionMask({ input, output, clipHeight }) {
  const sourcePath = path.join(imageRoot, input);
  const outputPath = path.join(imageRoot, output);
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const alpha = new Uint8Array(info.width * info.height);
  for (let index = 0; index < alpha.length; index += 1) {
    alpha[index] = data[index * info.channels + 3];
  }

  const silhouette = createOrthogonalSilhouette(
    alpha,
    info.width,
    info.height,
    clipHeight,
  );
  const rgba = Buffer.alloc(info.width * info.height * 4);

  for (let index = 0; index < silhouette.length; index += 1) {
    rgba[index * 4] = 0;
    rgba[index * 4 + 1] = 0;
    rgba[index * 4 + 2] = 0;
    rgba[index * 4 + 3] = silhouette[index] ? 255 : 0;
  }

  await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .webp({ lossless: true, effort: 6 })
    .toFile(outputPath);

  console.log(`Generated ${path.relative(repositoryRoot, outputPath)}`);
}

for (const source of collisionSources) {
  await generateCollisionMask(source);
}
