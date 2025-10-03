import { Router, Request, Response } from "express";
import { imageUpload, extractOne } from "../images";
import { getImageInfoById } from "../models/images";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
// @ts-ignore
import { checkId } from "../typechecker";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(path.join(__dirname, ".."));

// download image by id
router.get("/download/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    checkId(id);
  } catch (e) {
    res.status(400).json({ message: "Invalid id format" });
    return;
  }

  const imagePath = path.join(rootDir, "uploads", "resized", `${id}.jpg`);

  try {
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath, (e) => {
        if (e) {
          console.log(`Error sending file ${imagePath}:`, e);
          // Avoid sending another response if headers already sent
          if (!res.headersSent) {
            res.status(500).json({ message: "Error sending image file." });
          }
        } else {
          console.log(`Successfully sent file: ${imagePath}`);
        }
      });
    } else {
      res.status(404).json({ message: "Image not found" });
      return;
    }
  } catch (e: any) {
    console.error("Error downloading image:", e);
    // Avoid sending another response if headers already sent
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Failed to download image.", error: e.message });
    }
  }
});

// get image info by id
router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    checkId(id);
  } catch (e) {
    res.status(400).json({ message: "Invalid id format" });
    return;
  }

  try {
    const id = req.params.id;

    const imageInfo = await getImageInfoById(id);

    if (!imageInfo) {
      res.status(404).json({ message: "No image found with that id" });
      return;
    }

    res.status(200).json(imageInfo);
  } catch (e) {
    res.status(500).json({ message: "Error getting image info", error: e });
  }
});

// upload image
router.post(
  "/",
  imageUpload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
      }

      const imageId = await extractOne(req);

      res.status(200).json({ imageId });
    } catch (e) {
      res.status(500).json({ message: "Error uploading image", error: e });
    }
  }
);

export default router;
