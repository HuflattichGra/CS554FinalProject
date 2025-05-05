import { Router, Request, Response } from 'express';
import posts from "../src/posts";
import client from '../redis/client';
const router = Router();
client.connect().then(() => { });

const apistring = 'POST:'

const deletePostCache = async () => {
    const keys = (await client.keys(apistring + "*"));
    for (let i = 0; i < keys.length; i++) {
        await client.del(keys[i]);
    }
}


//basic route that gets 20 posts
router.route('/').get(async (req, res) => {
    try {

        var cache = await client.get('recentPosts');

        if (cache == null) {
            var ret = await posts.getPosts();

            await client.set(apistring + 'recentPosts', JSON.stringify(ret));

            res.status(200).send(ret);
            return;
        }
        res.status(200).json(JSON.parse(cache));
    } catch (e) {
        res.status(400).send({ error: (e as Error).message });
    }
})
    .post(async (req, res) => {
        try {
            var body = req.body;

            var ret = await posts.addPost(body);

            await client.set(apistring + ret._id, JSON.stringify(ret));

            res.status(200).send(ret);
        } catch (e) {
            res.status(400).send({ error: (e as Error).message });
        }
    });


//handles most things post related
router.route('/:id')
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
    })
    ;

router.route('/user/:id')
    .get(async (req, res) => {
        try {
            var id = req.params.id;

            var ret = await posts.getPostsByUserId(id);

            res.status(200).send(ret);
        } catch (e) {
            res.status(400).send({ error: (e as Error).message });
        }
    });


export default router;