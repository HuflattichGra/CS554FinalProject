import { ObjectId } from 'mongodb';
import { posts } from '../config/mongoCollections';
import * as typecheck from '../typechecker.js';

export type Post = {
    _id: string;
    conventionID: string;
    userID: string;
    text: string;
    images: Array<string>;
    likes: Array<string>;
};

const checkIDS = (x: any,var_name:string) => {
    typecheck.checkId(x,var_name);
}

function DEBUG_generatePost() {
    var obj: Post = {
        _id: (new ObjectId()).toHexString(),
        conventionID: (new ObjectId().toHexString()),
        userID: (new ObjectId()).toHexString(),
        text: "This is a sample post",
        images: [],
        likes: []
    }
    return obj;
}

function checkPost(obj: any, needsID: boolean = false, noEmpty: boolean = true) {
    var postObj: Post = obj;
    if (obj._id != undefined || needsID) { typecheck.checkId(obj._id, "post.id"); }
    if (obj.conventionID != undefined || noEmpty) { if(obj.conventionID.length > 0){ typecheck.checkId(obj.conventionID, "post.conventionID"); } }
    if (obj.userID != undefined || noEmpty) { typecheck.checkId(obj.userID, "post.userID"); }
    if (obj.text != undefined || noEmpty) { postObj.text = typecheck.checkStringTrimmed(obj.text, "post.text"); }
    if (obj.images != undefined || noEmpty) { if(obj.images.length > 0){obj.images.map(checkIDS, "post.images"); }}
    if (obj.likes != undefined || noEmpty) { if(obj.likes.length > 0){obj.likes.map(checkIDS, "post.likes"); }}
    return postObj;
}

async function addPost(obj: Post) {
    obj = checkPost(obj, false, true);

    const db = await posts();
    var dbOut = await db.insertOne(obj);
    if (dbOut == null) {
        throw new Error("Post was not found in DB");
    }

    var id: string = (dbOut.insertedId.toHexString());

    var retVal: Post = await getPost(id);

    return retVal;
}

async function getPost(id: string) {
    typecheck.checkId(id);

    const db = await posts();
    var retVal: Post = await db.findOne({ _id: ObjectId.createFromHexString(id) });

    if (retVal == null) {
        throw new Error("Post with id " + id + " not found");
    }

    return retVal;
}

async function getPosts() {
    const db = await posts();
    var retVal: Post = await db.find({}).toArray();

    if (retVal == null) {
        throw new Error("No posts are available");
    }

    return retVal;
}

async function updatePost(id: string, obj: any) {
    typecheck.checkId(id);
    checkPost(obj, false, false);
    delete obj._id;

    const db = await posts();
    var updateRes: Post = await db.updateOne({ _id: ObjectId.createFromHexString(id) }, [{ $set: obj }]);

    if (updateRes == null) {
        throw new Error("No posts are available");
    }

    var retVal = await getPost(id);

    return retVal;
}

async function deletePost(id: string) {
    typecheck.checkId(id,"id");

    const db = await posts();
    var retVal: Post = await getPost(id);
    var deleteRes: Post = await db.deleteOne({ _id: ObjectId.createFromHexString(id) });

    if (deleteRes == null) {
        throw new Error("delete of " + deleteRes + "failed");
    }

    return retVal;
}

async function getPostsByUserId(id: string) { 
    typecheck.checkId(id);

    const db = await posts();
    var retVal: Post = await db.find({userID: ObjectId.createFromHexString(id)}).toArray();

    if (retVal == null) {
        throw new Error("No posts are available");
    }

    return retVal;
}

export default { checkPost, addPost, getPosts, getPost, updatePost, deletePost, DEBUG_generatePost, getPostsByUserId };
