import {Router, Request, Response} from 'express';
import userData from '../src/users';
import {checkId} from '../typechecker.js';
import client from "../redis/client.js";

const router = Router();

//Signs up + creates session
router
    .route('/signup')
    .post(async (req: Request, res: Response) => {
        if(req.session.user){
            return res.status(400).json({error: "cannot sign up while there is an active session"});
        }

        if(!req.body["firstname"]) return res.status(400).json({error: 'no firstname was supplied'});
        if(!req.body["lastname"]) return res.status(400).json({error: 'no lastname was supplied'});
        if(!req.body["username"]) return res.status(400).json({error: 'no username was supplied'});
        if(!req.body["password"]) return res.status(400).json({error: 'no password was supplied'});

        let user = null;

        try{
            user = await userData.signUpUser(req.body["firstname"], req.body["lastname"], req.body["username"], req.body["password"])
        } catch (e){
            return res.status(400).json({error: e});
        }

        if (user === null){
            return res.status(500).json({error: "failed to save to server"})
        }

        req.session.user = user
        await client.set("user:" + user._id, JSON.stringify(user));

        return res.status(200).json(user)
    })

//Logs In + Creates Session
router
    .route('/login')
    .post(async (req: Request, res: Response)=>{
        if(req.session.user){
            return res.status(400).json({error: "cannot sign up while there is an active session"});
        }

        if(!req.body["username"]) return res.status(400).json({error: 'no username was supplied'});
        if(!req.body["password"]) return res.status(400).json({error: 'no password was supplied'});

        let user = null;

        try{
            user = await userData.signInUser(req.body["username"], req.body["password"])
        } catch (e){
            return res.status(404).json({error: e});
        }

        req.session.user = user
        await client.set("user:" + user._id, JSON.stringify(user));

        return res.status(200).json(user)
    })

//TEST
router
    .route('/user/:id')
    .get( async (req: Request, res: Response) => {
        let id = req.params.id

        try{
            checkId(id, "User Id");
        } catch (e){
            return res.status(400).json({error: e})
        }

        let exists = await client.exists("user:" + id)

        if(exists){
            //Don't need to parse since server returns objectIds as strings anyways
            let user = await client.get('user:' + id);

            return res.status(200).json(user);
        }
        else{
            let user = null;
            
            try{
                user = await userData.getUserById(id)
            } catch (e){
                return res.status(404).json({error: e})
            }

            await client.set('user:' + user._id, JSON.stringify(user))

            return res.status(200).json(user);
        }
    })

//Destroys Session
router
    .route('/logout')
    .get(async (req: Request, res: Response) => {
        req.session.destroy();

        return res.status(200).json({currentSessionDestroyed: true})
    })

export default router;