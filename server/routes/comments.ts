import {Router, Request, Response} from 'express';
import comments from "../src/comments";
const router = Router();

//basic route that gets 20 comments
router.route('/').get(async(req,res) => {
    try{
        var ret = await comments.getComments();

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
})
.post(async(req,res) => {
    try{
        var body = req.body;

        var ret = await comments.addComment(body);

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
});


//handles most things comment related
router.route('/:id')
.get(async(req,res) => {
    try{
        var id = req.params.id;

        var ret = await comments.getComment(id);

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
})
.patch(async(req,res) => {
    try{
        var id = req.params.id;
        var body = req.body;

        var ret = await comments.updateComment(id,body);

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
})
.delete(async(req,res) => {
    try{
        var id = req.params.id;

        var ret = await comments.deleteComment(id);

        res.status(200).send(ret);
    }catch(e){
        res.status(400).send({error:e});
    }
})
;

export default router;