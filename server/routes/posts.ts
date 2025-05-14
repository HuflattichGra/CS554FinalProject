import { Router, Request, Response } from "express";
import posts from "../src/posts";
import client from "../redis/client";
import { imageUpload } from "../images/upload";
import { extractMultiple } from "../images/extract";
import { ObjectId } from "mongodb";
// @ts-ignore
import { checkStringTrimmed, checkId } from "../typechecker";
import {users} from "../config/mongoCollections"
const router = Router();

const apistring = "POST:";

const deletePostCache = async () => {
  const keys = await client.keys(apistring + "*");
  for (let i = 0; i < keys.length; i++) {
    await client.del(keys[i]);
  }
};

router
  .route("/")
  .get(async (req, res) => {
    try {
      var cache = await client.get("recentPosts");

      if (cache == null) {
        var ret = await posts.getPosts();

        await client.set(apistring + "recentPosts", JSON.stringify(ret));

        res.status(200).send(ret);
        return;
      }
      res.status(200).json(JSON.parse(cache));
    } catch (e) {
      res.status(400).send({ error: (e as Error).message });
    }
  })
  .post(imageUpload.array("images"), async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session.user) {
        res.status(401).send({ error: "You must be logged in to create a post" });
        return;
      }

      const { text, conventionID, userID } = req.body;
      if (!text || !userID) {
        res.status(400).send({ error: "Missing required fields: text, userID" });
        return;
      }

      // Verify that the logged-in user is the same as the userID in the request
      if (req.session.user._id !== userID) {
        res.status(403).send({ error: "You can only create posts as yourself" });
        return;
      }

      const validatedText = checkStringTrimmed(text, "text");

      // Validate IDs first
      const validatedUserID = checkId(userID, "userID");
      let validatedConventionID = conventionID
        ? checkId(conventionID, "conventionID")
        : null;

      // Import ObjectId for direct conversion
      const { ObjectId } = await import("mongodb");

      // Convert to ObjectId
      const userObjectId = ObjectId.createFromHexString(validatedUserID);
      const conventionObjectId = validatedConventionID
        ? ObjectId.createFromHexString(validatedConventionID)
        : null;

      let imageIds: string[] = [];
      if (Array.isArray(req.files) && req.files.length > 0) {
        const ids = await extractMultiple(req);
        imageIds = ids.map((id) => id.toString());
      }

      const postData = {
        text: validatedText,
        conventionID: conventionObjectId,
        userID: userObjectId,
        images: imageIds,
        likes: [],
      };

      const ret = await posts.addPost(postData);
      await client.set(apistring + ret._id, JSON.stringify(ret));

      res.status(200).send(ret);
    } catch (e) {
      res.status(400).send({ error: (e as Error).message });
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      var id = req.params.id;
      var cache = await client.get(apistring + id);

      if (cache == null || req.query._t) {
        // Skip cache if _t query param exists (force refresh)
        var ret = await posts.getPost(id);

        await client.set(apistring + ret._id, JSON.stringify(ret));

        res.status(200).send(ret);
        return;
      }

      res.status(200).send(JSON.parse(cache));
    } catch (e) {
      res.status(400).send({ error: (e as Error).message });
    }
  })
  .patch(imageUpload.array("images"), async (req: Request, res: Response) => {
    try {
      // Check if user is logged in
      if (!req.session.user) {
        res.status(401).send({ error: "You must be logged in to edit a post" });
        return;
      }

      const id = req.params.id;
      const body = req.body;

      // Get the user ID from the request body (should be sent by the client)
      const userId = body.userID;

      // Check if user ID is provided
      if (!userId) {
        res.status(400).send({ error: "You must provide a user ID to edit a post" });
        return;
      }

      // Verify that the logged-in user is the same as the userID in the request
      if (req.session.user._id !== userId) {
        res.status(403).send({ error: "You can only edit your own posts" });
        return;
      }

      // Retrieve the post to check ownership
      const existingPost = await posts.getPost(id);

      // Check if the current user is the owner of the post
      if (existingPost.userID.toString() !== userId.toString()) {
        res.status(403).send({ error: "You can only edit your own posts" });
        return;
      } // Handle image uploads if there are any new images
      console.log("Update post request:", {
        keepImages: body.keepImages,
        newFiles: req.files?.length || 0,
      });

      if (Array.isArray(req.files) && req.files.length > 0) {
        const ids = await extractMultiple(req);
        const imageIds = ids.map((id) => id.toString());

        // If there are existing images to keep, merge them with the new ones
        if (body.keepImages && Array.isArray(body.keepImages)) {
          body.images = [...body.keepImages, ...imageIds];
        } else {
          body.images = imageIds;
        }
      } else if (body.keepImages && Array.isArray(body.keepImages)) {
        // No new images, but we have existing images to keep
        body.images = [...body.keepImages];
      } else if (body.images === "[]") {
        // Explicitly set empty images array
        body.images = [];
      }

      const ret = await posts.updatePost(id, body);

      // Update the cache with the new post data
      await client.set(apistring + ret._id, JSON.stringify(ret));

      // Also update the recent posts cache to reflect the change
      await deletePostCache();

      console.log("Updated post:", {
        postId: ret._id,
        images: ret.images,
        text: ret.text,
      });

      res.status(200).send(ret);
    } catch (e) {
      console.log(e);
      console.log({ error: (e as Error).message });
      res.status(400).send({ error: (e as Error).message });
    }
  })
  .delete(async (req, res) => {
    try {
      if (!req.session.user) {
        res.status(401).send({ error: "You must be logged in to delete a post" });
        return;
      }
      var id = req.params.id;

      var ret = await posts.deletePost(id, req.session.user._id);

      deletePostCache();
      
      const usersDb = await users();
        //Delete post from likes array
        var likedUsers = await usersDb.find({likes: ret._id}).toArray()
        for(let user of likedUsers){
          let likesToString = user.likes.map((like: ObjectId) => like.toString())
          let index = likesToString.indexOf(ret._id)
          user.likes.splice(index, 1)
          await usersDb.updateOne({_id: user._id}, {$set: user})
          await client.del("user:" + user._id);
        }
      
        //Delete post from bookmarks array
        var bookmarkedUsers = await usersDb.find({bookmarks: ret._id}).toArray()
        for(let user of bookmarkedUsers){
          let bookmarksToString = user.bookmarks.map((bookmark: ObjectId) => bookmark.toString())
          let index = bookmarksToString.indexOf(ret._id)
          user.bookmarks.splice(index, 1)
          await usersDb.updateOne({_id: user._id}, {$set: user})
          await client.del("user:" + user._id);
        }

      res.status(200).send(ret);
    } catch (e) {
      res.status(400).send({ error: (e as Error).message });
    }
  });

router.route("/user/:id").get(async (req, res) => {
  try {
    var id = req.params.id;

    var ret = await posts.getPostsByUserId(id);

    res.status(200).send(ret);
  } catch (e) {
    res.status(400).send({ error: (e as Error).message });
  }
});

router.route("/convention/:id").get(async (req, res) => {
  try {
    var id = req.params.id;

    var ret = await posts.getPostsByConventionId(id);

    res.status(200).send(ret);
  } catch (e) {
    res.status(400).send({ error: (e as Error).message });
  }
});

// Get posts by userID. Returns all posts by users that the user is following
router.route("/following/:id").get(async (req, res) => {
  try {
    var id = req.params.id;

    var ret = await posts.getPostsByFollowing(id);

    res.status(200).send(ret);
  } catch (e) {
    res.status(400).send({ error: (e as Error).message });
  }
});

export default router;
