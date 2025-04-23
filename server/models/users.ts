import {users} from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';
import {checkString, checkStringTrimmed} from '../typechecker.js';

//TEST:
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
        "conventionsAttending": [],
        "bookmarks": [],
        "likes": [],
        "conventionsFollowing": [],
        "following": [],
        "followers": 0
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
        "conventionsAttending": [],
        "bookmarks": [],
        "likes": [],
        "conventionsFollowing": [],
        "following": [],
        "followers": 0
    }
}

//TEST:
export const signInUser = async (username: string, password: string) => {
    //username error checking
    username = checkStringTrimmed(username, "username")
    if(username.length < 5) throw "username or password in invalid!"

    let hasNum = false;
    let hasChar = false;

    for(let char of username){
        let i = char.charCodeAt(0)

        if(((i > 96) && (i < 123)) || ((i > 64) && (i < 91))) hasChar = true;
        //48-57 = numbers
        else if((i > 47) && (i < 58)) hasNum = true;
        else throw "username or password in invalid!"
    }

    if ((hasNum === true) && (hasChar === false)) throw "username or password in invalid!"

    //password error checking
    //Do not set password to trimmed password
    checkString(password, "password")
    if(password.length < 8) throw "username or password in invalid!"

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
  
    if(!hasNum || !hasUpper || !hasLower || !hasSpecial) throw "username or password in invalid!"

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
        "conventionsAttending": user.conventionsAttending,
        "bookmarks": user.bookmarks,
        "likes": user.likes,
        "conventionsFollowing": user.conventionsFollowing,
        "following": user.following,
        "followers": user.followers
    }
}

export default {signInUser, signUpUser}