import { readdir, rename } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const roots = [
  { directory: "public/media/tools/mobile", suffix: "-mobile-v2.png", width: 960, height: 960 },
  { directory: "public/media/tools/variations", suffix: "-desktop-v1.png", width: 1440, height: 810 },
];

for (const root of roots) {
  const files = (await readdir(root.directory)).filter((file) => file.endsWith(root.suffix));

  for (const file of files) {
    const input = path.join(root.directory, file);
    const output = `${input}.normalized.png`;

    await sharp(input)
      .resize(root.width, root.height, { fit: "cover", position: "centre" })
      .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
      .toFile(output);
    await rename(output, input);
  }

  console.log(`Normalized ${files.length} images in ${root.directory}`);
}
