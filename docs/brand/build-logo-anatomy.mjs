import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(here, '../../assets-source/brand/source/felya-labs-symbol-black.png');
const outputDirectory = path.join(here, 'assets/logo-anatomy');
const systemOutputDirectory = path.join(here, 'assets/system-demo');

const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const alphaThreshold = 64;
const visited = new Uint8Array(width * height);
const components = [];

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const start = y * width + x;
    if (visited[start] || data[start * channels + 3] < alphaThreshold) continue;

    const pixels = [];
    const stack = [start];
    visited[start] = 1;

    while (stack.length) {
      const pixel = stack.pop();
      pixels.push(pixel);
      const pixelY = Math.floor(pixel / width);
      const pixelX = pixel - pixelY * width;

      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (offsetX === 0 && offsetY === 0) continue;
          const nextX = pixelX + offsetX;
          const nextY = pixelY + offsetY;
          if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) continue;
          const next = nextY * width + nextX;
          if (!visited[next] && data[next * channels + 3] >= alphaThreshold) {
            visited[next] = 1;
            stack.push(next);
          }
        }
      }
    }

    if (pixels.length > 1000) components.push(pixels);
  }
}

components.sort((left, right) => right.length - left.length);

if (components.length !== 5) {
  throw new Error(`Expected five connected logo forms, found ${components.length}.`);
}

const [circle, ...remaining] = components;
const point = remaining.find((component) => {
  const averageY = component.reduce((sum, pixel) => sum + Math.floor(pixel / width), 0) / component.length;
  return averageY > height * 0.75;
});
const flame = remaining.filter((component) => component !== point).flat();

const renderLayer = async (name, activePixels, color = [0, 0, 0]) => {
  const active = new Uint8Array(width * height);
  for (const pixel of activePixels) active[pixel] = 1;

  const output = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const target = pixel * 4;
    output[target] = color[0];
    output[target + 1] = color[1];
    output[target + 2] = color[2];
    output[target + 3] = active[pixel] ? data[pixel * channels + 3] : 0;
  }

  await sharp(output, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(outputDirectory, `${name}.png`));
};

await mkdir(outputDirectory, { recursive: true });
await mkdir(systemOutputDirectory, { recursive: true });
await Promise.all([
  sharp(source).png({ compressionLevel: 9, palette: true }).toFile(path.join(outputDirectory, 'full-mark.png')),
  renderLayer('point', point),
  renderLayer('circle', circle),
  renderLayer('flame', flame),
  renderLayer('full-mark-muted', components.flat(), [156, 166, 179]),
  renderLayer('point-blue', point, [63, 96, 189]),
  renderLayer('circle-blue', circle, [63, 96, 189]),
  renderLayer('flame-blue', flame, [63, 96, 189]),
  renderLayer('flame-gold', flame, [169, 120, 37]),
]);

const renderSystemLayer = async (sourcePath, outputName, color) => {
  const { data: layerData, info: layerInfo } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const output = Buffer.alloc(layerInfo.width * layerInfo.height * 4);

  for (let pixel = 0; pixel < layerInfo.width * layerInfo.height; pixel += 1) {
    const sourceOffset = pixel * layerInfo.channels;
    const targetOffset = pixel * 4;
    const alpha = layerInfo.channels === 4
      ? layerData[sourceOffset + 3]
      : 255 - Math.round((layerData[sourceOffset] + layerData[sourceOffset + 1] + layerData[sourceOffset + 2]) / 3);
    output[targetOffset] = color[0];
    output[targetOffset + 1] = color[1];
    output[targetOffset + 2] = color[2];
    output[targetOffset + 3] = alpha;
  }

  await sharp(output, { raw: { width: layerInfo.width, height: layerInfo.height, channels: 4 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(systemOutputDirectory, outputName));
};

const systemSources = path.resolve(here, '../../public/assets/images/system');
const operatorSources = path.join(systemSources, 'operator');
const systemVariants = [
  ['dark', [209, 213, 219], [84, 117, 216], [131, 162, 255], [160, 170, 184]],
  ['light', [89, 99, 113], [53, 91, 195], [80, 123, 232], [89, 99, 113]],
];

await Promise.all(systemVariants.flatMap(([theme, neutral, suit, gloves, robot]) => [
  renderSystemLayer(path.join(operatorSources, 'paton-operator-long-mask.webp'), `operator-long-${theme}.png`, neutral),
  renderSystemLayer(path.join(operatorSources, 'paton-operator-short-mask.webp'), `operator-short-${theme}.png`, neutral),
  renderSystemLayer(path.join(operatorSources, 'paton-operator-suit-mask.webp'), `operator-suit-${theme}.png`, suit),
  renderSystemLayer(path.join(operatorSources, 'paton-operator-glove-left-hand-mask.webp'), `operator-glove-left-${theme}.png`, gloves),
  renderSystemLayer(path.join(operatorSources, 'paton-operator-glove-right-hand-mask.webp'), `operator-glove-right-${theme}.png`, gloves),
  renderSystemLayer(path.join(systemSources, 'openarm-system-blueprint-refined.webp'), `robot-${theme}.png`, robot),
]));

console.log(`Brand guide assets exported to ${outputDirectory} and ${systemOutputDirectory}`);
