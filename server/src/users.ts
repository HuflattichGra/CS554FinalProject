import {users, images, conventions, posts} from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';
import { ObjectId } from "mongodb"
import {checkString, checkStringTrimmed, checkId} from '../typechecker.js';

interface user {
    firstname: string,
    lastname: string,
    username: string,
    password: string,
    admin: boolean,
    bio: string,
    pfp?: ObjectId,
    conventionsAttending:  ObjectId[],
    bookmarks: ObjectId[],
    likes: ObjectId[],
    conventionsFollowing: ObjectId[],
    following: ObjectId[],
    followers: ObjectId[]
}

interface updateUser {
    firstname?: string,
    lastname?: string,
    username?: string,
    password?: string,
    admin?: boolean,
    bio?: string,
    pfp?: string ,
    conventionsAttending?: string[],
    bookmarks?: string[],
    likes?: string[],
    conventionsFollowing?: string[],
    following?: string[],
    followers?: string[]
}

export const signUpUser = async (firstname : string, lastname: string, username: string, password: string) => {
    //firstname error checking
    firstname = checkStringTrimmed(firstname, "first name")
    if (firstname.length < 3) throw "first name is below 3 characters!"
    if (firstname.length > 25) throw "first name is above 25 characters!"

    let hasChar: boolean = false;

    for(let char of firstname){
        let i = char.charCodeAt(0)
        
        //97-122 = lowercase alphabet
        //65-90 = uppercase alphabet
        //32 = space
        //45 = hyphen
        //39 = apostrophe
        //46 = period (or full-stop)
        if(((i > 96) && (i < 123)) || ((i > 64) && (i < 91))) hasChar = true
        else if((i != 32) && (i != 45) && (i != 39) && (i != 46)) throw "first name contains invalid characters!"
    }

    if (hasChar === false) throw "first name contains no letters"
    
    //lastname error checking
    lastname = checkStringTrimmed(lastname, "last name")
    if (lastname.length < 3) throw "last name is below 3 characters!"
    if (lastname.length > 25) throw "last name is above 25 characters!"

    hasChar = false;

    for(let char of lastname){
        let i = char.charCodeAt(0)
        
        //97-122 = lowercase alphabet
        //65-90 = uppercase alphabet
        //32 = space
        //45 = hyphen
        //39 = apostrophe
        //46 = period (or full-stop)
        if(((i > 96) && (i < 123)) || ((i > 64) && (i < 91))) hasChar = true
        else if((i != 32) && (i != 45) && (i != 39) && (i != 46)) throw "last name contains invalid characters!"
    }

    if (hasChar === false) throw "last name contains no letters"

    //username error checking
    username = checkStringTrimmed(username, "username")
    if(username.length < 5) throw "username is below 5 characters!"

    let hasNum: boolean = false;
    hasChar = false;

    for(let char of username){
        let i = char.charCodeAt(0)

        if(((i > 96) && (i < 123)) || ((i > 64) && (i < 91))) hasChar = true;
        //48-57 = numbers
        else if((i > 47) && (i < 58)) hasNum = true;
        else throw "username contains an invalid character!"
    }

    if ((hasNum === true) && (hasChar === false)) throw "username only contains numbers!"

    //Checks if username already in use
    const userCollection = await users();
    const user = await userCollection.findOne({username: { $regex: "(?i)^" + username + "$(?-i)"}});
    if (user !== null) throw `username ${username} is already taken`;

    //password error checking
    //Do not set password to trimmed password
    checkString(password, "password")
    if(password.length < 8) throw "password is below 8 characters!"

    hasNum = false;
    let hasUpper: boolean = false;
    let hasLower: boolean = false;
    let hasSpecial: boolean = false;
      
    for(let x of password){
        let y = x.charCodeAt(0);
        if((y > 47) && (y < 58)) hasNum = true;
        else if((y > 64) && (y < 91)) hasUpper = true;
        else if ((y > 96) && (y < 123)) hasLower = true;
        else if(((y >= 32) && (y < 48)) || ((y > 57) && (y < 65)) || ((y > 90) && (y < 97)) || (y > 122)) hasSpecial = true;
    }
  
    if(!hasNum || !hasUpper || !hasLower || !hasSpecial) throw "password must contain 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 number!";

    let hashedPassword: string = await bcrypt.hash(password, 16); 

    //add user to database
    let newUser = {
        "firstname": firstname,
        "lastname": lastname,
        "username": username,
        "password": hashedPassword,
        "admin": false,
        "bio": "",
        "pfp": undefined,
        "conventionsAttending": [],
        "bookmarks": [],
        "likes": [],
        "conventionsFollowing": [],
        "following": [],
        "followers": []
    }

    const insertInfo = await userCollection.insertOne(newUser);

    if (!insertInfo.acknowledged || !insertInfo.insertedId){
        throw "could not add user";
    }
    
    return {
        "_id": insertInfo.insertedId, 
        "firstname": firstname,
        "lastname": lastname,
        "username": username,
        "admin": false,
        "bio": "",
        "pfp": undefined,
        "conventionsAttending": [],
        "bookmarks": [],
        "likes": [],
        "conventionsFollowing": [],
        "following": [],
        "followers": []
    }
}

export const signInUser = async (username: string, password: string) => {
    //username error checking
    username = checkStringTrimmed(username, "username")
    if(username.length < 5) throw "username or password is invalid!"

    let hasNum = false;
    let hasChar = false;

    for(let char of username){
        let i = char.charCodeAt(0)

        if(((i > 96) && (i < 123)) || ((i > 64) && (i < 91))) hasChar = true;
        //48-57 = numbers
        else if((i > 47) && (i < 58)) hasNum = true;
        else throw "username or password is invalid!"
    }

    if ((hasNum === true) && (hasChar === false)) throw "username or password is invalid!"

    //password error checking
    //Do not set password to trimmed password
    if (checkString(password, "password")) throw "username or password is invalid"
    if(password.length < 8) throw "username or password is invalid!"

    hasNum = false;
    let hasUpper = false;
    let hasLower = false;
    let hasSpecial = false;
      
    for(let x of password){
        let y = x.charCodeAt(0);
        if((y > 47) && (y < 58)) hasNum = true;
        else if((y > 64) && (y < 91)) hasUpper = true;
        else if ((y > 96) && (y < 123)) hasLower = true;
        else if(((y >= 32) && (y < 48)) || ((y > 57) && (y < 65)) || ((y > 90) && (y < 97)) || (y > 122)) hasSpecial = true;
    }
  
    if(!hasNum || !hasUpper || !hasLower || !hasSpecial) throw "username or password is invalid!"

    //Search for user via name(case insensitive)
    const userCollection = await users();
    const user = await userCollection.findOne({username: { $regex: "(?i)^" + username + "$(?-i)"}});
    if(user === null) throw "username or password is invalid";
    
    let comparePassword = false;
    
    try{
        comparePassword = await bcrypt.compare(password, user.password);
    } catch (e){}
    
    if(!comparePassword) throw "username or password is invalid";

    return {
        "_id": user._id, 
        "firstname": user.firstname,
        "lastname": user.lastname,
        "username": user.username,
        "admin": user.admin,
        "bio": user.bio,
        "pfp": user.pfp,
        "conventionsAttending": user.conventionsAttending,
        "bookmarks": user.bookmarks,
        "likes": user.likes,
        "conventionsFollowing": user.conventionsFollowing,
        "following": user.following,
        "followers": user.followers
    }
}

export const getUserById = async (id: string) => {
    checkId(id, "User Id")

    const userCollection = await users();
    const user = await userCollection.findOne({_id: ObjectId.createFromHexString(id)})
    if (user === null) throw "User Not Found";

    return {
        "_id": user._id, 
        "firstname": user.firstname,
        "lastname": user.lastname,
        "username": user.username,
        "admin": user.admin,
        "bio": user.bio,
        "pfp": user.pfp,
        "conventionsAttending": user.conventionsAttending,
        "bookmarks": user.bookmarks,
        "likes": user.likes,
        "conventionsFollowing": user.conventionsFollowing,
        "following": user.following,
        "followers": user.followers
    }
}

export const updateUser = async (id: string, user: updateUser) => {
    checkId(id, "User Id");

    const userCollection = await users();
    const newUser : user = await userCollection.findOne({_id: ObjectId.createFromHexString(id)})
    if (newUser === null) throw "User Not Found";

    //firstname error checking
    if (user.firstname != undefined){
        let firstname = checkStringTrimmed(user.firstname, "first name")
        if (firstname.length < 3) throw "first name is below 3 characters!"
        if (firstname.length > 25) throw "first name is above 25 characters!"

        let hasChar: boolean = false;

        for(let char of firstname){
            let i = char.charCodeAt(0)
            
            //97-122 = lowercase alphabet
            //65-90 = uppercase alphabet
            //32 = space
            //45 = hyphen
            //39 = apostrophe
            //46 = period (or full-stop)
            if(((i > 96) && (i < 123)) || ((i > 64) && (i < 91))) hasChar = true
            else if((i != 32) && (i != 45) && (i != 39) && (i != 46)) throw "first name contains invalid characters!"
        }

        if (hasChar === false) throw "first name contains no letters"

        newUser.firstname = firstname;
    }
    //lastname error checking
    if (user.lastname !== undefined){
        let lastname = checkStringTrimmed(user.lastname, "last name")
        if (lastname.length < 3) throw "last name is below 3 characters!"
        if (lastname.length > 25) throw "last name is above 25 characters!"

        let hasChar = false;

        for(let char of lastname){
            let i = char.charCodeAt(0)
            
            //97-122 = lowercase alphabet
            //65-90 = uppercase alphabet
            //32 = space
            //45 = hyphen
            //39 = apostrophe
            //46 = period (or full-stop)
            if(((i > 96) && (i < 123)) || ((i > 64) && (i < 91))) hasChar = true
            else if((i != 32) && (i != 45) && (i != 39) && (i != 46)) throw "last name contains invalid characters!"
        }

        if (hasChar === false) throw "last name contains no letters"

        newUser.lastname = lastname
    }
    //username error checking
    if (user.username !== undefined){
        let username = checkStringTrimmed(user.username, "username")
        if(username.length < 5) throw "username is below 5 characters!"

        let hasNum: boolean = false;
        let hasChar = false;

        for(let char of username){
            let i = char.charCodeAt(0)

            if(((i > 96) && (i < 123)) || ((i > 64) && (i < 91))) hasChar = true;
            //48-57 = numbers
            else if((i > 47) && (i < 58)) hasNum = true;
            else throw "username contains an invalid character!"
        }

        if ((hasNum === true) && (hasChar === false)) throw "username only contains numbers!"

        //Checks if username already in use
        const otherUser = await userCollection.findOne({username: { $regex: "(?i)^" + username + "$(?-i)"}});
        if (otherUser !== null) throw `username ${username} is already taken`;

        newUser.username = username
    }
    //password error checking
    //Do not set password to trimmed password
    if (user.password !== undefined){
        let password = user.password;
        checkString(password, "password")
        if(password.length < 8) throw "password is below 8 characters!"

        let hasNum = false;
        let hasUpper: boolean = false;
        let hasLower: boolean = false;
        let hasSpecial: boolean = false;
        
        for(let x of password){
            let y = x.charCodeAt(0);
            if((y > 47) && (y < 58)) hasNum = true;
            else if((y > 64) && (y < 91)) hasUpper = true;
            else if ((y > 96) && (y < 123)) hasLower = true;
            else if(((y >= 32) && (y < 48)) || ((y > 57) && (y < 65)) || ((y > 90) && (y < 97)) || (y > 122)) hasSpecial = true;
        }
    
        if(!hasNum || !hasUpper || !hasLower || !hasSpecial) throw "password must contain 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 number!";

        //Check if password is the same
        let comparePassword = false

        try{
            comparePassword = await bcrypt.compare(password, newUser.password);
        } catch (e){}
        
        if(!comparePassword) throw "New password is same as old password!";

        let hashedPassword: string = await bcrypt.hash(password, 16);
        newUser.password = hashedPassword; 
    }
    //Profile Picture error checking
    if(user.pfp !== undefined){
        checkId(user.pfp, "Profile Picture")

        let imageCollection = await images();
        const image = await imageCollection.findOne({_id: ObjectId.createFromHexString(user.pfp)})
        if(image === null) throw "Profile Picture does not exist"

        newUser.pfp = ObjectId.createFromHexString(user.pfp);
    }
    //TODO: Update Delete Convention and Remove Attendee so that convention id removed from conventionsAttending list
    //conventionsAttending Checking
    if(user.conventionsAttending !== undefined){
        if(!Array.isArray(user.conventionsAttending)) throw "Conventions Attending is not an array"

        let conventionIds = [];

        for (let id of user.conventionsAttending ){
            checkId(id, "Convention id")

            let conventionCollection = await conventions();
            const convention = await conventionCollection.findOne({_id: ObjectId.createFromHexString(id)})
            if (convention === null) throw "Convention within Conventions Attending list does not exist"

            conventionIds.push(ObjectId.createFromHexString(id))
        }

        newUser.conventionsAttending = conventionIds;
    }
    //TODO: Update Delete Post so that bookmarked posts are removeed from list
    //bookmarks Checking
    if(user.bookmarks !== undefined){
        if(!Array.isArray(user.bookmarks)) throw "Bookmarks is not an array"

        let bookmarkIds = [];

        for (let id of user.bookmarks ){
            checkId(id, "Post id")

            let postCollection = await posts();
            const post = await postCollection.findOne({_id: ObjectId.createFromHexString(id)})
            if (post === null) throw "Post within Bookmarks list does not exist"

            bookmarkIds.push(ObjectId.createFromHexString(id))
        }

        newUser.bookmarks = bookmarkIds;
    }
    //TODO: Update Delete Post + Like Post so that liked posts are removeed from list
    //likes Checking
    if(user.likes !== undefined){
        if(!Array.isArray(user.likes)) throw "Likes is not an array"

        let likeIds = [];

        for (let id of user.likes ){
            checkId(id, "Post id")

            let postCollection = await posts();
            const post = await postCollection.findOne({_id: ObjectId.createFromHexString(id)})
            if (post === null) throw "Post within Bookmarks list does not exist"

            likeIds.push(ObjectId.createFromHexString(id))
        }

        newUser.likes = likeIds;
    }
    //Following checking
    if(user.following !== undefined){
        if(!Array.isArray(user.following)) throw "Following is not an array"

        let followingIds = [];

        for (let id of user.following ){
            checkId(id, "User id")

            const user = await userCollection.findOne({_id: ObjectId.createFromHexString(id)})
            if (user === null) throw "User within Following list does not exist"

            followingIds.push(ObjectId.createFromHexString(id))
        }

        newUser.following = followingIds;
    }
    //Followers Checking
    if(user.followers !== undefined){
        if(!Array.isArray(user.followers)) throw "Followers is not an array"

        let followersIds = [];

        for (let id of user.followers ){
            checkId(id, "Follower id")

            const user = await userCollection.findOne({_id: ObjectId.createFromHexString(id)})
            if (user === null) throw "User within Follower list does not exist"

            followersIds.push(ObjectId.createFromHexString(id))
        }

        newUser.followers = followersIds;
    }

    const updatedUser = await userCollection.findOneAndUpdate({_id: ObjectId.createFromHexString(id)})

    return {
        "_id": updatedUser._id, 
        "firstname": updatedUser.firstname,
        "lastname": updatedUser.lastname,
        "username": updatedUser.username,
        "admin": updatedUser.admin,
        "bio": updatedUser.bio,
        "pfp": updatedUser.pfp,
        "conventionsAttending": updatedUser.conventionsAttending,
        "bookmarks": updatedUser.bookmarks,
        "likes": updatedUser.likes,
        "conventionsFollowing": updatedUser.conventionsFollowing,
        "following": updatedUser.following,
        "followers": updatedUser.followers
    }
}

export default {signInUser, signUpUser, getUserById, updateUser}