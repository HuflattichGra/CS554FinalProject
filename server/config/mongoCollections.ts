import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection:any) => {
  let _col:any = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export const users = getCollectionFn("users");
export const posts = getCollectionFn("posts");
export const conventions = getCollectionFn("conventions");
export const comments = getCollectionFn("comments");
export const images = getCollectionFn("images");
