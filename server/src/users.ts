import {
  users,
  images,
  conventions,
  posts,
} from "../config/mongoCollections.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { checkString, checkStringTrimmed, checkId } from "../typechecker.js";

export interface user {
  _id: ObjectId;
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  admin: boolean;
  bio: string;
  pfp?: ObjectId;
  conventionsAttending: ObjectId[];
  bookmarks: ObjectId[];
  likes: ObjectId[];
  conventionsFollowing: ObjectId[];
  following: ObjectId[];
  followers: ObjectId[];
  balance: number;
}

interface updateUser {
  firstname?: string;
  lastname?: string;
  username?: string;
  password?: string;
  admin?: boolean;
  bio?: string;
  pfp?: string;
  conventionsAttending?: string;
  bookmarks?: string;
  likes?: string;
  conventionsFollowing?: string;
  following?: string;
  followers?: string;
  balance?: number;
}

export const signUpUser = async (
  firstname: string,
  lastname: string,
  username: string,
  password: string
) => {
  //firstname error checking
  firstname = checkStringTrimmed(firstname, "first name");
  if (firstname.length < 3) throw "first name is below 3 characters!";
  if (firstname.length > 25) throw "first name is above 25 characters!";

  let hasChar: boolean = false;

  for (let char of firstname) {
    let i = char.charCodeAt(0);

    //97-122 = lowercase alphabet
    //65-90 = uppercase alphabet
    //32 = space
    //45 = hyphen
    //39 = apostrophe
    //46 = period (or full-stop)
    if ((i > 96 && i < 123) || (i > 64 && i < 91)) hasChar = true;
    else if (i != 32 && i != 45 && i != 39 && i != 46)
      throw "first name contains invalid characters!";
  }

  if (hasChar === false) throw "first name contains no letters";

  //lastname error checking
  lastname = checkStringTrimmed(lastname, "last name");
  if (lastname.length < 3) throw "last name is below 3 characters!";
  if (lastname.length > 25) throw "last name is above 25 characters!";

  hasChar = false;

  for (let char of lastname) {
    let i = char.charCodeAt(0);

    //97-122 = lowercase alphabet
    //65-90 = uppercase alphabet
    //32 = space
    //45 = hyphen
    //39 = apostrophe
    //46 = period (or full-stop)
    if ((i > 96 && i < 123) || (i > 64 && i < 91)) hasChar = true;
    else if (i != 32 && i != 45 && i != 39 && i != 46)
      throw "last name contains invalid characters!";
  }

  if (hasChar === false) throw "last name contains no letters";

  //username error checking
  username = checkStringTrimmed(username, "username");
  if (username.length < 5) throw "username is below 5 characters!";

  let hasNum: boolean = false;
  hasChar = false;

  for (let char of username) {
    let i = char.charCodeAt(0);

    if ((i > 96 && i < 123) || (i > 64 && i < 91)) hasChar = true;
    //48-57 = numbers
    else if (i > 47 && i < 58) hasNum = true;
    else throw "username contains an invalid character!";
  }

  if (hasNum === true && hasChar === false)
    throw "username only contains numbers!";

  //Checks if username already in use
  const userCollection = await users();
  const user = await userCollection.findOne({
    username: { $regex: "(?i)^" + username + "$(?-i)" },
  });
  if (user !== null) throw `username ${username} is already taken`;

  //password error checking
  //Do not set password to trimmed password
  checkString(password, "password");
  if (password.length < 8) throw "password is below 8 characters!";

  hasNum = false;
  let hasUpper: boolean = false;
  let hasLower: boolean = false;
  let hasSpecial: boolean = false;

  for (let x of password) {
    let y = x.charCodeAt(0);
    if (y > 47 && y < 58) hasNum = true;
    else if (y > 64 && y < 91) hasUpper = true;
    else if (y > 96 && y < 123) hasLower = true;
    else if (
      (y >= 32 && y < 48) ||
      (y > 57 && y < 65) ||
      (y > 90 && y < 97) ||
      y > 122
    )
      hasSpecial = true;
  }

  if (!hasNum || !hasUpper || !hasLower || !hasSpecial)
    throw "password must contain 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 number!";

  let hashedPassword: string = await bcrypt.hash(password, 16);

  //add user to database
  let newUser = {
    firstname: firstname,
    lastname: lastname,
    username: username,
    password: hashedPassword,
    admin: false,
    bio: "No Information Provided",
    pfp: undefined,
    conventionsAttending: [],
    bookmarks: [],
    likes: [],
    conventionsFollowing: [],
    following: [],
    followers: [],
    balance: 0,
  };

  const insertInfo = await userCollection.insertOne(newUser);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw "could not add user";
  }

  return {
    _id: insertInfo.insertedId,
    firstname: firstname,
    lastname: lastname,
    username: username,
    admin: false,
    bio: "No Information Provided",
    pfp: undefined,
    conventionsAttending: [],
    bookmarks: [],
    likes: [],
    conventionsFollowing: [],
    following: [],
    followers: [],
    balance: 0,
  };
};

export const signInUser = async (username: string, password: string) => {
  //username error checking
  username = checkStringTrimmed(username, "username");
  if (username.length < 5) throw "username or password is invalid!";

  let hasNum = false;
  let hasChar = false;

  for (let char of username) {
    let i = char.charCodeAt(0);

    if ((i > 96 && i < 123) || (i > 64 && i < 91)) hasChar = true;
    //48-57 = numbers
    else if (i > 47 && i < 58) hasNum = true;
    else throw "username or password is invalid!";
  }

  if (hasNum === true && hasChar === false)
    throw "username or password is invalid!";

  //password error checking
  //Do not set password to trimmed password
  if (checkString(password, "password"))
    throw "username or password is invalid";
  if (password.length < 8) throw "username or password is invalid!";

  hasNum = false;
  let hasUpper = false;
  let hasLower = false;
  let hasSpecial = false;

  for (let x of password) {
    let y = x.charCodeAt(0);
    if (y > 47 && y < 58) hasNum = true;
    else if (y > 64 && y < 91) hasUpper = true;
    else if (y > 96 && y < 123) hasLower = true;
    else if (
      (y >= 32 && y < 48) ||
      (y > 57 && y < 65) ||
      (y > 90 && y < 97) ||
      y > 122
    )
      hasSpecial = true;
  }

  if (!hasNum || !hasUpper || !hasLower || !hasSpecial)
    throw "username or password is invalid!";

  //Search for user via name(case insensitive)
  const userCollection = await users();
  const user = await userCollection.findOne({
    username: { $regex: "(?i)^" + username + "$(?-i)" },
  });
  if (user === null) throw "username or password is invalid";

  let comparePassword = false;

  try {
    comparePassword = await bcrypt.compare(password, user.password);
  } catch (e) {}

  if (!comparePassword) throw "username or password is invalid";

  return {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    admin: user.admin,
    bio: user.bio,
    pfp: user.pfp,
    conventionsAttending: user.conventionsAttending,
    bookmarks: user.bookmarks,
    likes: user.likes,
    conventionsFollowing: user.conventionsFollowing,
    following: user.following,
    followers: user.followers,
    balance: user.balance,
  };
};

export const getUserById = async (id: string) => {
  checkId(id, "User Id");

  const userCollection = await users();
  const user = await userCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  if (user === null) throw "User Not Found";

  return {
    _id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    admin: user.admin,
    bio: user.bio,
    pfp: user.pfp,
    conventionsAttending: user.conventionsAttending,
    bookmarks: user.bookmarks,
    likes: user.likes,
    conventionsFollowing: user.conventionsFollowing,
    following: user.following,
    followers: user.followers,
    balance: user.balance,
  };
};

export const updateUser = async (id: string, user: updateUser) => {
  checkId(id, "User Id");

  const userCollection = await users();
  const newUser: user = await userCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  if (newUser === null) throw "User Not Found";

  //firstname error checking
  if (user.firstname != undefined) {
    let firstname = checkStringTrimmed(user.firstname, "first name");
    if (firstname.length < 3) throw "first name is below 3 characters!";
    if (firstname.length > 25) throw "first name is above 25 characters!";

    let hasChar: boolean = false;

    for (let char of firstname) {
      let i = char.charCodeAt(0);

      //97-122 = lowercase alphabet
      //65-90 = uppercase alphabet
      //32 = space
      //45 = hyphen
      //39 = apostrophe
      //46 = period (or full-stop)
      if ((i > 96 && i < 123) || (i > 64 && i < 91)) hasChar = true;
      else if (i != 32 && i != 45 && i != 39 && i != 46)
        throw "first name contains invalid characters!";
    }

    if (hasChar === false) throw "first name contains no letters";

    newUser.firstname = firstname;
  }
  //lastname error checking
  if (user.lastname !== undefined) {
    let lastname = checkStringTrimmed(user.lastname, "last name");
    if (lastname.length < 3) throw "last name is below 3 characters!";
    if (lastname.length > 25) throw "last name is above 25 characters!";

    let hasChar = false;

    for (let char of lastname) {
      let i = char.charCodeAt(0);

      //97-122 = lowercase alphabet
      //65-90 = uppercase alphabet
      //32 = space
      //45 = hyphen
      //39 = apostrophe
      //46 = period (or full-stop)
      if ((i > 96 && i < 123) || (i > 64 && i < 91)) hasChar = true;
      else if (i != 32 && i != 45 && i != 39 && i != 46)
        throw "last name contains invalid characters!";
    }

    if (hasChar === false) throw "last name contains no letters";

    newUser.lastname = lastname;
  }
  //username error checking
  if (user.username !== undefined) {
    let username = checkStringTrimmed(user.username, "username");
    if (username.length < 5) throw "username is below 5 characters!";

    let hasNum: boolean = false;
    let hasChar = false;

    for (let char of username) {
      let i = char.charCodeAt(0);

      if ((i > 96 && i < 123) || (i > 64 && i < 91)) hasChar = true;
      //48-57 = numbers
      else if (i > 47 && i < 58) hasNum = true;
      else throw "username contains an invalid character!";
    }

    if (hasNum === true && hasChar === false)
      throw "username only contains numbers!";

    //Checks if username already in use
    if (user.username !== newUser.username) {
      const otherUser = await userCollection.findOne({
        username: { $regex: "(?i)^" + username + "$(?-i)" },
      });
      if (otherUser !== null) throw `username ${username} is already taken`;
    }
    newUser.username = username;
  }
  //password error checking
  //Do not set password to trimmed password
  if (user.password !== undefined) {
    let password = user.password;
    checkString(password, "password");
    if (password.length < 8) throw "password is below 8 characters!";

    let hasNum = false;
    let hasUpper: boolean = false;
    let hasLower: boolean = false;
    let hasSpecial: boolean = false;

    for (let x of password) {
      let y = x.charCodeAt(0);
      if (y > 47 && y < 58) hasNum = true;
      else if (y > 64 && y < 91) hasUpper = true;
      else if (y > 96 && y < 123) hasLower = true;
      else if (
        (y >= 32 && y < 48) ||
        (y > 57 && y < 65) ||
        (y > 90 && y < 97) ||
        y > 122
      )
        hasSpecial = true;
    }

    if (!hasNum || !hasUpper || !hasLower || !hasSpecial)
      throw "password must contain 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 number!";

    //Check if password is the same
    let comparePassword = false;

    try {
      comparePassword = await bcrypt.compare(password, newUser.password);
    } catch (e) {}

    if (comparePassword) throw "New password is same as old password!";

    let hashedPassword: string = await bcrypt.hash(password, 16);
    newUser.password = hashedPassword;
  }

  if (user.bio !== undefined) {
    checkString(user.bio, "bio");
    let bio : string = user.bio.trim();

    if(bio.length === 0) bio = "No Information Provided"

    if (bio.length > 256) throw "Error: Bio is too long!";

    newUser.bio = bio;
  }
  //TODO: Fix this
  //Profile Picture error checking
  if (user.pfp !== undefined) {
    checkId(user.pfp, "Profile Picture");

    let imageCollection = await images();
    const image = await imageCollection.findOne({
      _id: ObjectId.createFromHexString(user.pfp),
    });
    if (image === null) throw "Profile Picture does not exist";

    newUser.pfp = ObjectId.createFromHexString(user.pfp);
  }
  //TODO: Update Delete Conventions
  //conventionsAttending Checking
  if (user.conventionsAttending !== undefined) {
    checkId(user.conventionsAttending, "Convention id");

    let conId = ObjectId.createFromHexString(user.conventionsAttending);

    let conventionCollection = await conventions();
    const convention = await conventionCollection.findOne({ _id: conId });
    if (convention === null) throw "Convention Attending Does Not Exist";

    let consAttendingStr = newUser.conventionsAttending.map((id) =>
      id.toString()
    );
    let index = consAttendingStr.indexOf(user.conventionsAttending);

    if (index === -1) {
      convention.attendees.push(newUser._id);
      newUser.conventionsAttending.push(conId);
    } else {
      let attendeesStr = convention.attendees.map((id: ObjectId) =>
        id.toString()
      );
      convention.attendees = convention.attendees.splice(
        attendeesStr.indexOf(id)
      );
      newUser.conventionsAttending = newUser.conventionsAttending.splice(
        index,
        1
      );
    }

    const updatedConvention = await conventionCollection.updateOne(
      { _id: conId },
      { $set: convention }
    );
  }
  //TODO: Update Delete Post
  //bookmarks Checking
  if (user.bookmarks !== undefined) {
    checkId(user.bookmarks, "Bookmark id");

    let postId = ObjectId.createFromHexString(user.bookmarks);

    // Check if the post exists
    let postCollection = await posts();
    const post = await postCollection.findOne({ _id: postId });
    if (post === null) throw "Bookmarked Post does not exist";

    let bookmarksStr = newUser.bookmarks.map((id) => id.toString());
    let index = bookmarksStr.indexOf(user.bookmarks);

    if (index === -1) {
      // Add bookmark
      newUser.bookmarks.push(postId);
    } else {
      // Remove bookmark
      newUser.bookmarks.splice(index, 1);
    }
  }
  //TODO: Update Delete Post
  //likes Checking
  if (user.likes !== undefined) {
    checkId(user.likes, "Liked Post id");

    let postId = ObjectId.createFromHexString(user.likes);

    let postCollection = await posts();
    const post = await postCollection.findOne({ _id: postId });
    if (post === null) throw "Liked Post does not exist";

    let userLikes = newUser.likes.map((id) => id.toString());
    let index = userLikes.indexOf(user.likes);

    if (index === -1) {
      // Add like
      post.likes.push(newUser._id);
      newUser.likes.push(postId);
    } else {
      // Remove like
      let postLikes = post.likes.map((id: ObjectId) => id.toString());
      let postLikeIndex = postLikes.indexOf(newUser._id.toString());
      if (postLikeIndex !== -1) {
        post.likes.splice(postLikeIndex, 1);
      }
      newUser.likes.splice(index, 1);
    }

    const updatedPost = await postCollection.updateOne(
      { _id: postId },
      { $set: post }
    );
  }
  //TODO: Update Delete Conventions
  //conventionsFollowing Checking
  if (user.conventionsFollowing !== undefined) {
    checkId(user.conventionsFollowing, "Convention id");

    let conId = ObjectId.createFromHexString(user.conventionsFollowing);

    // Check if the convention exists
    let conventionCollection = await conventions();
    const convention = await conventionCollection.findOne({ _id: conId });
    if (convention === null) throw "Convention to follow does not exist";

    let consFollowingStr = newUser.conventionsFollowing.map((id) =>
      id.toString()
    );
    let index = consFollowingStr.indexOf(user.conventionsFollowing);

    if (index === -1) {
      newUser.conventionsFollowing.push(conId);
    } else {
      newUser.conventionsFollowing = newUser.conventionsFollowing.splice(
        index,
        1
      );
    }
  }
  //Following checking
  if (user.following !== undefined) {
    checkId(user.following, "User id");
    if (id === user.following) throw "Error: User cannot follow themselves";

    let FollowId = ObjectId.createFromHexString(user.following);

    const userFollowing = await userCollection.findOne({ _id: FollowId });
    if (userFollowing === null) throw "User Does Not Exist";

    let following = newUser.following.map((id) => id.toString());
    let index = following.indexOf(user.following);

    if (index === -1) {
      userFollowing.followers.push(newUser._id);
      newUser.following.push(FollowId);
    } else {
      let followers = userFollowing.followers.map((userId: ObjectId) =>
        userId.toString()
      );
      //console.log(followers.indexOf(id))
      userFollowing.followers.splice(followers.indexOf(id), 1);
      newUser.following.splice(index, 1);
    }

    const updatedConvention = await userCollection.updateOne(
      { _id: FollowId },
      { $set: userFollowing }
    );
  }
  //Followers Checking
  if (user.followers !== undefined) {
    checkId(user.followers, "User id");

    if (id === user.followers) throw "Error: User cannot follow themselves";

    let FollowerId = ObjectId.createFromHexString(user.followers);

    const follower = await userCollection.findOne({ _id: FollowerId });
    if (follower === null) throw "User Does Not Exist";

    let followers = newUser.followers.map((id) => id.toString());
    let index = followers.indexOf(user.followers);

    if (index === -1) {
      follower.following.push(newUser._id);
      newUser.followers.push(FollowerId);
    } else {
      let following = follower.following.map((userId: ObjectId) =>
        userId.toString()
      );
      follower.following.splice(following.indexOf(id), 1);
      newUser.followers.splice(index, 1);
    }

    const updatedConvention = await userCollection.updateOne(
      { _id: FollowerId },
      { $set: follower }
    );
  }
  // Balance checking and updating
  if (user.balance !== undefined) {
    if (isNaN(user.balance) || user.balance < 0) {
      throw "Balance must be a non-negative number";
    }

    // If updating balance, add to existing balance rather than replacing it
    // This ensures the payment adds to existing balance rather than replacing it
    newUser.balance = (newUser.balance || 0) + user.balance;
  }

  const updateRes = await userCollection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: newUser }
  );

  if (updateRes == null) {
    throw new Error("No users are available");
  }

  const updatedUser: any = await getUserById(id);

  return {
    _id: updatedUser._id,
    firstname: updatedUser.firstname,
    lastname: updatedUser.lastname,
    username: updatedUser.username,
    admin: updatedUser.admin,
    bio: updatedUser.bio,
    pfp: updatedUser.pfp,
    conventionsAttending: updatedUser.conventionsAttending,
    bookmarks: updatedUser.bookmarks,
    likes: updatedUser.likes,
    conventionsFollowing: updatedUser.conventionsFollowing,
    following: updatedUser.following,
    followers: updatedUser.followers,
    balance: updatedUser.balance,
  };
};

export default { signInUser, signUpUser, getUserById, updateUser };
