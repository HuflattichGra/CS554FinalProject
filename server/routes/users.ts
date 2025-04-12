import {Router, Request, Response} from 'express';
import userData from '../models/users';
const router = Router();


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

        return res.status(200).json(user)
    })

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

        return res.status(200).json(user)
    })

//TEST:
router
    .route('/logout')
    .get(async (req: Request, res: Response) => {
        req.session.destroy();

        return res.status(200).json({currentSessionDestroyed: true})
    })

export default router;