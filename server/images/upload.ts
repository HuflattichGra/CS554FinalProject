import multer, { diskStorage } from "multer";
import { ObjectId } from "mongodb";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(path.join(__dirname, ".."));

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(rootDir, "uploads/original/"));
  },
  filename: (req, file, cb) => {
    const name = new ObjectId().toString();
    const ext = path.extname(file.originalname);
    cb(null, name + ext);
  },
});

export const imageUpload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});
