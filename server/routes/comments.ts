import { Router, Request, Response } from 'express';
import comments from "../src/comments";
import client, { parseRedisData } from "../redis/client.js";
const router = Router();

const apistring = 'COMMENTS:'

const deletePostCache = async () => {
    const keys = (await client.keys(apistring + "*"));
    for (let i = 0; i < keys.length; i++) {
        await client.del(keys[i]);
    }
}

//basic route that gets 20 comments
router.route('/').get(async (req, res) => {
    try {
        var ret = await comments.getComments();

        res.status(200).send(ret);
    } catch (e) {
        res.status(400).send({ error: e });
    }
})
    .post(async (req, res) => {
        try {
            const user = req.session?.user;
            if (!user || !user._id) {
              return res.status(401).json({ error: 'User not logged in' });
            }
            var body : any = req.body;
            
            body.createdAt = new Date(Date.now());
            body.likes = [];

            var ret = await comments.addComment(body, user._id);

            await client.set(apistring + ret._id, JSON.stringify(ret));

            res.status(200).send(ret);
        } catch (e:any) {
            res.status(400).send({ error: e.message});
        }
    });


//handles most things comment related
router.route('/:id')
    .get(async (req, res) => {
        try {
            var id = req.params.id;

            var cache = await client.get(apistring + id);

            if (cache == null) {
                var ret = await comments.getComment(id);

                await client.set(apistring + ret._id, JSON.stringify(ret));

                res.status(200).send(ret);
                return;
            }

            res.status(200).send(parseRedisData(cache));
        } catch (e) {
            res.status(400).send({ error: e });
        }
    })
    .patch(async (req, res) => {
        try {
            const user = req.session?.user;
            if (!user || !user._id) {
              return res.status(401).json({ error: 'User not logged in' });
            }
            var id = req.params.id;
            var body = req.body;

            var ret = await comments.updateComment(id, body, user._id);

            await client.set(apistring + ret._id, JSON.stringify(ret));

            res.status(200).send(ret);
        } catch (e:any) {
            console.log(e);
            res.status(400).send({ error: e.message });
        }
    })
    .delete(async (req, res) => {
        try {
            const user = req.session?.user;
            if (!user || !user._id) {
              return res.status(401).json({ error: 'User not logged in' });
            }
            var id = req.params.id;

            var ret = await comments.deleteComment(id, user._id);

            deletePostCache();

            res.status(200).send(ret);
        } catch (e:any) {
            res.status(400).send({ error: e.message });
        }
    })
    ;

router.route("/posts/:id").get(async (req,res) => {
    try {
        var id = req.params.id;
        var ret :any = await comments.getCommmentFromPost(id);

        await client.set(apistring + ret._id, JSON.stringify(ret));

        res.status(200).send(ret);
    }catch(e:any){
        res.status(400).send({ error: e.message });
    }
})

export default router;