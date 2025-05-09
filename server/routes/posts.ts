import { Router, Request, Response } from "express";
import posts from "../src/posts";
import client from "../redis/client";
import { imageUpload } from "../images/upload";
import { extractMultiple } from "../images/extract";
// @ts-ignore
import { checkStringTrimmed, checkId } from "../typechecker";
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
      const { text, conventionID, userID } = req.body;
      if (!text || !userID) {
        throw new Error("Missing required fields: text, userID");
      }
      const validatedText = checkStringTrimmed(text, "text");
      const validatedUserID = checkId(userID, "userID");
      let validatedConventionID = conventionID;
      if (conventionID) {
        validatedConventionID = checkId(conventionID, "conventionID");
      }

      let imageIds: string[] = [];
      if (Array.isArray(req.files) && req.files.length > 0) {
        const ids = await extractMultiple(req);
        imageIds = ids.map((id) => id.toString());
      }

      const postData = {
        text: validatedText,
        conventionID: validatedConventionID,
        userID: validatedUserID,
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

      if (cache == null) {
        var ret = await posts.getPost(id);

        await client.set(apistring + ret._id, JSON.stringify(ret));

        res.status(200).send(ret);
        return;
      }

      res.status(200).send(cache);
    } catch (e) {
      res.status(400).send({ error: (e as Error).message });
    }
  })
  .patch(async (req, res) => {
    try {
      var id = req.params.id;
      var body = req.body;

      var ret = await posts.updatePost(id, body);

      await client.set(apistring + ret._id, JSON.stringify(ret));

      res.status(200).send(ret);
    } catch (e) {
      res.status(400).send({ error: (e as Error).message });
    }
  })
  .delete(async (req, res) => {
    try {
      var id = req.params.id;

      var ret = await posts.deletePost(id);

      deletePostCache();

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

export default router;
