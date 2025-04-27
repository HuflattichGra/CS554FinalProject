import { Request } from "express";
import { ObjectId } from "mongodb";
import { createImageInfo, createImagesInfo } from "../models/images";
import { ImageType, processImage, processImages } from "./imagemagick";

export const extractOne = async (req: Request): Promise<ObjectId> => {
  const { file } = req;
  const type = req.body.imageType as ImageType;
  if (!file) {
    throw new Error("No image file uploaded");
  }

  const filePath = file.path;
  const fileName = file.filename;
  const imageId = fileName.split(".")[0];
  const imageObjectId = new ObjectId(imageId);

  await processImage(filePath, type);

  const imageInfo = {
    _id: imageObjectId,
    type: type,
  };

  const insertedImage = await createImageInfo(imageInfo);
  if (!insertedImage) {
    throw new Error("Failed to create image info in the database");
  }
  return insertedImage._id;
};

export const extractMultiple = async (req: Request): Promise<ObjectId[]> => {
  const { files } = req;
  const type = req.body.imageType as ImageType;
  if (!files) {
    throw new Error("No files uploaded");
  }
  const fileArray = Array.isArray(files) ? files : Object.values(files).flat();
  const paths = fileArray.map((file) => file.path);
  const objectIds = fileArray.map((file) => {
    const fileName = file.filename;
    const imageId = fileName.split(".")[0];
    return new ObjectId(imageId);
  });

  await processImages(paths, type);

  const imageInfos = objectIds.map((id) => {
    return {
      _id: id,
      type: type,
    };
  });
  const insertedImages = await createImagesInfo(imageInfos);
  if (!insertedImages || insertedImages.length === 0) {
    throw new Error("Failed to create image info in the database");
  }
  return insertedImages.map((image) => image._id);
};
