import { ObjectId } from "mongodb";
import { posts, users, conventions } from "../config/mongoCollections";
import comments from "./comments";
// @ts-ignore
import * as typecheck from "../typechecker.js";
import { Request } from 'express';

export type Post = {
  _id: string;
  conventionID?: string; // Make conventionID optional
  userID: string;
  text: string;
  images: Array<string>;
  likes: Array<string>;
  createdAt: Date;
};

const checkIDS = (x: any, var_name: string) => {
  typecheck.checkId(x, var_name);
};

function DEBUG_generatePost() {
  var obj: Post = {
    _id: new ObjectId().toHexString(),
    conventionID: new ObjectId().toHexString(),
    userID: new ObjectId().toHexString(),
    text: "This is a sample post",
    images: [],
    likes: [],
    createdAt: new Date(Date.now()),
  };
  return obj;
}

function checkPost(
  obj: any,
  needsID: boolean = false,
  noEmpty: boolean = true
) {
  var postObj: Post = obj;
  if (obj._id != undefined || needsID) {
    typecheck.checkId(obj._id, "post.id");
  }
  if (obj.conventionID != undefined && obj.conventionID !== null) {
    if (obj.conventionID.length > 0) {
      typecheck.checkId(obj.conventionID, "post.conventionID");
    }
  }
  if (obj.userID != undefined || noEmpty) {
    typecheck.checkId(obj.userID, "post.userID");
  }
  if (obj.text != undefined || noEmpty) {
    postObj.text = typecheck.checkStringTrimmed(obj.text, "post.text");
  }
  if (obj.images != undefined || noEmpty) {
    if (obj.images.length > 0) {
      obj.images.map(checkIDS, "post.images");
    }
  }
  if (obj.likes != undefined || noEmpty) {
    if (obj.likes.length > 0) {
      obj.likes.map(checkIDS, "post.likes");
    }
  }
  return postObj;
}

async function addPost(obj: any) {
  obj.userID = obj.userID.toHexString();
  // Only convert conventionID to hex string if it exists
  if (obj.conventionID) {
    obj.conventionID = obj.conventionID.toHexString();
  }
  obj = checkPost(obj, false, true);

  // Check if user exists
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: ObjectId.createFromHexString(obj.userID) });
  if (user === null) {
    throw new Error("User does not exist");
  }

  // Check if convention exists if conventionID is provided
  if (obj.conventionID) {
    const conventionCollection = await conventions();
    const convention = await conventionCollection.findOne({ _id: ObjectId.createFromHexString(obj.conventionID) });
    if (convention === null) {
      throw new Error("Convention does not exist");
    }
  }

  obj.userID = ObjectId.createFromHexString(obj.userID);
  if (obj.conventionID) {
    obj.conventionID = ObjectId.createFromHexString(obj.conventionID);
  }

  obj.createdAt = new Date(Date.now());

  const db = await posts();
  var dbOut = await db.insertOne(obj);
  if (dbOut == null) {
    throw new Error("Post was not found in DB");
  }

  var id: string = dbOut.insertedId.toHexString();

  var retVal: Post = await getPost(id);

  return retVal;
}

async function getPost(id: string) {
  typecheck.checkId(id);

  const db = await posts();
  var retVal: Post = await db.findOne({
    _id: ObjectId.createFromHexString(id),
  });

  if (retVal == null) {
    throw new Error("Post with id " + id + " not found");
  }

  return retVal;
}

async function getPosts() {
  const db = await posts();
  var retVal: Array<Post> = await db.find({}).toArray();

  if (retVal == null) {
    throw new Error("No posts are available");
  }

  retVal.sort(sortByDate);

  return retVal;
}

async function updatePost(id: string, obj: any) {
  typecheck.checkId(id);
  checkPost(obj, false, false);
  delete obj._id;

  // Check if user exists
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: ObjectId.createFromHexString(obj.userID) });
  if (user === null) {
    throw new Error("User does not exist");
  }

  // Check if convention exists if conventionID is provided
  if (obj.conventionID) {
    const conventionCollection = await conventions();
    const convention = await conventionCollection.findOne({ _id: ObjectId.createFromHexString(obj.conventionID) });
    if (convention === null) {
      throw new Error("Convention does not exist");
    }
  }

  obj.userID = ObjectId.createFromHexString(obj.userID);
  if (obj.conventionID) {
    obj.conventionID = ObjectId.createFromHexString(obj.conventionID);
  }

  const db = await posts();
  var updateRes: Post = await db.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    [{ $set: obj }]
  );

  if (updateRes == null) {
    throw new Error("No posts are available");
  }

  var retVal = await getPost(id);

  return retVal;
}

async function deletePost(id: string, userId: string) {
  typecheck.checkId(id, "id");
  typecheck.checkId(userId, "id");
  const db = await posts();
  var retVal: Post = await getPost(id);

  // Check if post exists
  if (!retVal) {
    throw new Error("Post not found");
  }

  // Check if current user is the creator of the post
  if (retVal.userID.toString() !== userId) {
    throw new Error("You can only delete your own posts");
  }

  var postComments = await comments.getCommmentFromPost(id);

  for(let i=0;i<postComments.length;i++){
    await comments.deleteComment(postComments[i]._id);
  }


  var deleteRes: Post = await db.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });

  if (deleteRes == null) {
    throw new Error("delete of " + deleteRes + "failed");
  }

  return retVal;
}

async function getPostsByUserId(id: string) {
  typecheck.checkId(id);

  const db = await posts();
  var retVal: Array<Post> = await db
    .find({ userID: ObjectId.createFromHexString(id) })
    .toArray();

  if (retVal == null) {
    throw new Error("No posts are available");
  }

  retVal.sort(sortByDate);

  return retVal;
}

async function getPostsByConventionId(id: string) {
  typecheck.checkId(id);

  const db = await posts();
  var retVal: Array<Post> = await db
    .find({ conventionID: ObjectId.createFromHexString(id) })
    .toArray();

  if (retVal == null) {
    throw new Error("No posts are available");
  }

  retVal.sort(sortByDate);

  return retVal;
}

async function getPostsByFollowing(id: string) {
  typecheck.checkId(id);

  // Get the user to access their following list
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });

  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }

  if (!user.following || user.following.length === 0) {
    return []; // Return empty array if user is not following anyone
  }

  // Convert following array to an array of ObjectIds
  const followingIds = user.following.map((userId: any) =>
    userId instanceof ObjectId
      ? userId
      : ObjectId.createFromHexString(userId.toString())
  );

  const db = await posts();
  var retVal: Array<Post> = await db
    .find({ userID: { $in: followingIds } })
    .toArray();

  if (retVal == null) {
    throw new Error("No posts are available");
  }

  retVal.sort(sortByDate);

  return retVal;
}

function sortByDate(a: Post, b: Post) {
  return a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0;
}

export default {
  checkPost,
  addPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  DEBUG_generatePost,
  getPostsByUserId,
  getPostsByConventionId,
  getPostsByFollowing,
};
