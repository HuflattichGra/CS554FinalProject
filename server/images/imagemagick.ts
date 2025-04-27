import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(path.join(__dirname, ".."));

// Determine the current operating system
const isWindows = os.platform() === "win32";

export type ImageType = "profile" | "post";

export const validImageType = (type: ImageType): boolean => {
  return ["profile", "post"].includes(type);
};

const execPromise = promisify(exec);

export const processImage = async (
  input: string,
  type: ImageType
): Promise<void> => {
  const fileNameWithoutExt = path.basename(input, path.extname(input));
  const output = path.join(
    rootDir,
    "uploads",
    "resized",
    `${fileNameWithoutExt}.jpg`
  );

  let command: string;
  // Use different command format based on operating system
  const magickCommand = isWindows ? "magick" : "convert";

  switch (type) {
    case "profile":
      command = `${magickCommand} ${input} -resize 200x200 ${output}`;
      break;
    case "post":
      command = `${magickCommand} ${input} -resize 800x600 ${output}`;
      break;
    default:
      throw new Error("Invalid image type");
  }

  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      throw new Error(`Error processing image: ${stderr}`);
    }
    console.log(`Image processed successfully: ${stdout}`);
    console.log(`Output saved to: ${output}`);
  } catch (e) {
    // Clean up incomplete files
    if (fs.existsSync(output)) {
      try {
        fs.unlinkSync(output);
      } catch (e) {
        console.log(`Error deleting incomplete file ${output}:`, e);
      }
    }
    throw e;
  } finally {
    // Remove the input file if it exists
    if (fs.existsSync(input)) {
      try {
        fs.unlinkSync(input);
      } catch (e) {
        console.log(`Error deleting input file ${input}:`, e);
      }
    }
  }
};

export const processImages = async (
  inputs: string[],
  type: ImageType
): Promise<void> => {
  Promise.all(inputs.map((input) => processImage(input, type)))
    .then(() => {
      console.log("All images processed successfully");
    })
    .catch((error) => {
      console.log("Error processing images:", error);
    });
};
