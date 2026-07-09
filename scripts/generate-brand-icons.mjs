import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const source = path.join(
  process.env.USERPROFILE,
  ".cursor/projects/c-Users-ignacio-Desktop-SAAS/assets/c__Users_ignacio_AppData_Roaming_Cursor_User_workspaceStorage_2a03402e2136ef5c45988e6d8b402272_images_image-ff70b28c-7b31-4578-9895-005d00b722a9.png",
);

function circleMask(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`,
  );
}

async function buildCircularIcon(cropped, size, scale = 0.64) {
  const logoSize = Math.round(size * scale);
  const pad = Math.round((size - logoSize) / 2);

  return sharp(cropped)
    .resize(logoSize, logoSize, { fit: "cover" })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 236, g: 236, b: 234, alpha: 255 },
    })
    .resize(size, size)
    .composite([{ input: circleMask(size), blend: "dest-in" }])
    .png()
    .toBuffer();
}

const meta = await sharp(source).metadata();
const cropSize = Math.round(Math.min(meta.width, meta.height) * 0.48);
const left = Math.round((meta.width - cropSize) / 2);
const top = Math.round((meta.height - cropSize) / 2);

const cropped = await sharp(source)
  .extract({ left, top, width: cropSize, height: cropSize })
  .png()
  .toBuffer();

await sharp(await buildCircularIcon(cropped, 512, 0.64)).toFile(path.join(root, "public/brand/logo.png"));
await sharp(await buildCircularIcon(cropped, 32, 0.7)).toFile(path.join(root, "src/app/icon.png"));
await sharp(await buildCircularIcon(cropped, 180, 0.7)).toFile(path.join(root, "src/app/apple-icon.png"));

console.log("Generated circular brand icons", { cropSize });
