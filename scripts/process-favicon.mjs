/**
 * Strip near-black background, center on square canvas, opaque black pad, 512×512 PNG.
 *
 *   node scripts/process-favicon.mjs                 # reads app/icon.png
 *   node scripts/process-favicon.mjs path/to/source
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const defaultSrc = path.join(root, "app", "icon.png");
const src = path.resolve(process.argv[2] ?? defaultSrc);

async function main() {
  const buf = fs.readFileSync(src);
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const w = info.width;
  const h = info.height;
  const pixels = Buffer.from(data);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const max = Math.max(r, g, b);
    const sum = r + g + b;
    if (max < 48 && sum < 120) {
      pixels[i + 3] = 0;
    }
  }

  const trimmed = await sharp(pixels, {
    raw: { width: w, height: h, channels: 4 },
  })
    .trim({ threshold: 0 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const tw = trimmed.info.width;
  const th = trimmed.info.height;
  if (tw === 0 || th === 0) {
    throw new Error("Trim produced empty image — check source or thresholds");
  }

  const pad = Math.max(12, Math.round(Math.max(tw, th) * 0.12));
  const side = Math.max(tw, th) + 2 * pad;
  const extW = side - tw;
  const extH = side - th;

  const extendedPng = await sharp(trimmed.data, {
    raw: { width: tw, height: th, channels: 4 },
  })
    .extend({
      top: Math.floor(extH / 2),
      bottom: Math.ceil(extH / 2),
      left: Math.floor(extW / 2),
      right: Math.ceil(extW / 2),
      background: { r: 0, g: 0, b: 0, alpha: 255 },
    })
    .png()
    .toBuffer();

  const square = await sharp(extendedPng)
    .resize(512, 512, { fit: "fill" })
    .flatten({ background: { r: 0, g: 0, b: 0 } })
    .png()
    .toBuffer();

  const iconPath = path.join(root, "app", "icon.png");
  const applePath = path.join(root, "app", "apple-icon.png");
  fs.writeFileSync(iconPath, square);
  fs.writeFileSync(applePath, square);

  const check = await sharp(square).metadata();
  console.log("Wrote", iconPath, "→", check.width, "×", check.height, "RGBA");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
