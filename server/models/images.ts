import { ObjectId } from "mongodb";
// @ts-ignore
import { images } from "../config/mongoCollections";
// @ts-ignore
import { checkId } from "../typechecker.js";

interface ImageInfo {
  _id: ObjectId;
  type: string;
}

export const getImageInfoById = async (id: string) => {
  try {
    checkId(id);
  } catch (e) {
    throw new Error("Invalid id format");
  }

  const imageCollection = await images();
  const objectId = new ObjectId(id);

  const imageInfo = await imageCollection.findOne({ _id: objectId });

  if (!imageInfo) throw new Error("No image found with that id");

  return imageInfo;
};

export const createImageInfo = async (imageInfo: ImageInfo) => {
  if (!imageInfo) {
    throw new Error("You must provide the type for the image");
  }

  const imageCollection = await images();

  const insertInfo = await imageCollection.insertOne(imageInfo);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error("Could not add image");
  }

  return imageInfo;
};

export const createImagesInfo = async (imageInfos: ImageInfo[]) => {
  if (imageInfos.length === 0) {
    throw new Error("You must provide image infos");
  }

  const imageCollection = await images();

  const insertInfo = await imageCollection.insertMany(imageInfos);

  if (!insertInfo.acknowledged || !insertInfo.insertedIds) {
    throw new Error("Could not add images");
  }

  return imageInfos;
};
