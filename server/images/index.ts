import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type ImageType } from "./imagemagick.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ensureUploadDirExists = () => {
  try {
    const dirs = ["uploads/original", "uploads/resized"];
    const rootDir = path.resolve(path.join(__dirname, ".."));

    for (const dir of dirs) {
      const absolutePath = path.join(rootDir, dir);
      if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true });
        console.log(`Created directory: ${absolutePath}`);
      }
    }
  } catch (e) {
    console.log("Error creating upload directories:", e);
  }
};

export { type ImageType };
export { processImage, processImages } from "./imagemagick";
export { imageUpload } from "./upload";
export { extractOne, extractMultiple } from "./extract";
