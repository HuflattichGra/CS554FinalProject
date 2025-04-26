import {Router, Request, Response} from 'express';
import posts from "../src/posts";
const router = Router();

//basic route that gets 20 posts
router.route('/').get(async(req,res) => {
    try{
        var ret = await posts.getPosts();

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
})
.post(async(req,res) => {
    try{
        var body = req.body;

        var ret = await posts.addPost(body);

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
});


//handles most things post related
router.route('/:id')
.get(async(req,res) => {
    try{
        var id = req.params.id;

        var ret = await posts.getPost(id);

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
})
.patch(async(req,res) => {
    try{
        var id = req.params.id;
        var body = req.body;

        var ret = await posts.updatePost(id,body);

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
})
.delete(async(req,res) => {
    try{
        var id = req.params.id;

        var ret = await posts.deletePost(id);

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
})
;

router.route('/user/:id')
.get(async(req,res) => {
    try{
        var id = req.params.id;

        var ret = await posts.getPostsByUserId(id);

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
})

export default router;