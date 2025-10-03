import { ObjectId } from 'mongodb';
import { comments } from '../config/mongoCollections';
//@ts-ignore
import * as typecheck from "../typechecker";
import { posts } from '../config/mongoCollections';
import { users } from '../config/mongoCollections';

export type Comment = {
    _id: string
    postID: string
    userID: string
    text: string
    createdAt: Date,
    likes: Array<string>
};

const checkIDS = (x: any,var_name:string) => {
    typecheck.checkId(x,var_name);
}

function DEBUG_generateComment() {
    var today : Date = new Date();
    today.setTime(Date.now());
    var obj: Comment = {
        _id: (new ObjectId()).toHexString(),
        postID: (new ObjectId()).toHexString(),
        userID: (new ObjectId()).toHexString(),
        text: "THIS IS THE DEFAULT TEXT OF THE APP. The FitnessGram Pacer Test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter pacer test will begin in 30 seconds. Line up at the start. The running speed starts slowly but gets faster each minute after you hear this signal bodeboop. A sing lap should be completed every time you hear this sound. ding Remember to run in a straight line and run as long as possible. The second time you fail to complete a lap before the sound, your test is over. The test will begin on the word start. On your mark. Get ready!… Start. ding",
        createdAt: today,
        likes: []
    }
    return obj;
}

function checkComment(obj: any, needsID: boolean = false, noEmpty: boolean = true) {
    var comObj: Comment = obj;
    if (obj._id != undefined || needsID) { typecheck.checkId(obj._id, "comment.id"); }
    if (obj.postID != undefined || noEmpty) { typecheck.checkId(obj.postID, "comment.postID"); }
    if (obj.userID != undefined || noEmpty) { typecheck.checkId(obj.userID, "comment.userID"); }
    if (obj.text != undefined || noEmpty) { comObj.text = typecheck.checkStringTrimmed(obj.text, "comment.text"); }
    if (obj.createdAt != undefined || noEmpty) { if(obj.createdAt instanceof Date){}else{typecheck.checkDate(obj.createdAt,"comment.createdAt");}}
    if (obj.likes != undefined || noEmpty) { if(obj.likes.length){ obj.likes.map(checkIDS, "comment.likes"); } }
    return comObj;
}

async function addComment(obj: any, userId: string) {
    obj.likes=[];
    obj.createdAt = new Date(Date.now());

    obj = checkComment(obj, false, true);

    // Validate postID (required)
    if (!obj.postID) {
        throw new Error("Post ID is required");
    }
    const postsCollection = await posts();
    const post = await postsCollection.findOne({ _id: ObjectId.createFromHexString(obj.postID) });
    if (!post) {
        throw new Error("Post does not exist");
    }
    obj.postID = ObjectId.createFromHexString(obj.postID);

    // Validate userID (required)
    if (!obj.userID) {
        throw new Error("User ID is required");
    }
    if (!userId) {
        throw new Error("User ID from session is required");
    }
    // Check if the userID in the object matches the userId from session
    if (obj.userID !== userId) {
        throw new Error("You can only create comments as yourself");
    }
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: ObjectId.createFromHexString(obj.userID) });
    if (!user) {
        throw new Error("User does not exist");
    }
    obj.userID = ObjectId.createFromHexString(obj.userID);

    const db = await comments();
    var dbOut = await db.insertOne(obj);
    if (dbOut == null) {
        throw new Error("Comment was not found in DB");
    }

    var id: string = (dbOut.insertedId.toHexString());

    var retVal: Comment = await getComment(id);

    return retVal;
}

async function getComment(id: string) {
    typecheck.checkId(id);

    const db = await comments();
    var retVal: Comment = await db.findOne({ _id: ObjectId.createFromHexString(id) });

    if (retVal == null) {
        throw new Error("Comment with id " + id + " not found");
    }

    return retVal;
}

async function getComments() {
    const db = await comments();
    var retVal: Comment = await db.find({}).toArray();

    if (retVal == null) {
        throw new Error("No comments are available");
    }

    return retVal;
}

async function updateComment(id: string, obj: any, userId: string) {
    typecheck.checkId(id);
    checkComment(obj, false, false);
    delete obj._id;

    // Check if postID exists
    if (obj.postID) {
        const postsCollection = await posts();
        const post = await postsCollection.findOne({ _id: ObjectId.createFromHexString(obj.postID) });
        if (!post) {
            throw new Error("Post ID does not exist in the database");
        }
        obj.postID = ObjectId.createFromHexString(obj.postID);
    }

    // Check if userID exists
    if (obj.userID) {
        const usersCollection = await users();
        const user = await usersCollection.findOne({ _id: ObjectId.createFromHexString(obj.userID) });
        if (!user) {
            throw new Error("User ID does not exist in the database");
        }
        obj.userID = ObjectId.createFromHexString(obj.userID);
    }

    const db = await comments();
    var updateRes: Comment = await db.updateOne({ _id: ObjectId.createFromHexString(id) }, [{ $set: obj }]);

    if (updateRes == null) {
        throw new Error("No comments are available");
    }

    var retVal = await getComment(id);

    return retVal;
}
async function deleteComment(id: string, userId: string) {
    typecheck.checkId(id);
    typecheck.checkId(userId, "userId");

    // Get the comment first to check ownership
    const comment = await getComment(id);
    if (!comment) {
        throw new Error("Comment not found");
    }

    // Verify that the user is the owner of the comment
    if (comment.userID.toString() !== userId) {
        throw new Error("You can only delete your own comments");
    }

    const db = await comments();
    var deleteRes: Comment = await db.deleteOne({ _id: ObjectId.createFromHexString(id) });

    if (deleteRes == null) {
        throw new Error("delete of " + deleteRes + "failed");
    }

    return comment;
}

async function getCommmentFromPost(id:string) {
    typecheck.checkId(id);

    const db = await comments();
    var retVal : Array<Comment> = await db.find({ postID: ObjectId.createFromHexString(id) }).toArray();

    if(retVal == null){
        throw new Error("GetCommentFromPost " + id + " failed");
    }

    return retVal;
}

export default { checkComment, addComment, getComments, getComment, updateComment, deleteComment, DEBUG_generateComment,getCommmentFromPost };
