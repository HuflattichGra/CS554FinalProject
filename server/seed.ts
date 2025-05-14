import { dbConnection } from "./config/mongoConnection.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { signUpUser } from "./src/users.js";
import { createConvention } from "./src/conventions.js";
import * as postsModule from "./src/posts.js";
import * as commentsModule from "./src/comments.js";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to seed the database
const seedDB = async () => {
  console.log("Starting database seeding...");

  try {
    // Get DB connection
    const db = await dbConnection();

    // Truncate all collections
    await db.collection("users").deleteMany({});
    await db.collection("posts").deleteMany({});
    await db.collection("conventions").deleteMany({});
    await db.collection("comments").deleteMany({});
    await db.collection("images").deleteMany({});

    console.log("Database collections cleared.");

    // Clear uploads folder
    const uploadsDir = path.join(__dirname, "uploads");
    const originalDir = path.join(uploadsDir, "original");
    const resizedDir = path.join(uploadsDir, "resized");

    // Ensure directories exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    if (!fs.existsSync(originalDir)) {
      fs.mkdirSync(originalDir);
    }

    if (!fs.existsSync(resizedDir)) {
      fs.mkdirSync(resizedDir);
    }

    // Clear files in directories
    const clearDir = (dirPath: string) => {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
    };

    clearDir(originalDir);
    clearDir(resizedDir);

    console.log("Uploads folder cleared.");

    console.log("Creating users...");

    const hashedPassword = await bcrypt.hash("Password123!", 16);

    const userFilip = {
      firstname: "Filip",
      lastname: "Sigda",
      username: "FilipSigda",
      password: hashedPassword,
      admin: true,
      bio: "Filip Sigda bio",
      conventionsAttending: [],
      bookmarks: [],
      likes: [],
      conventionsFollowing: [],
      following: [],
      followers: [],
      balance: 200,
    };

    const userKonstantinos = {
      firstname: "Konstantinos",
      lastname: "Mokos",
      username: "KonstantinosMokos",
      password: hashedPassword,
      admin: false,
      bio: "Konstantinos Mokos bio",
      conventionsAttending: [],
      bookmarks: [],
      likes: [],
      conventionsFollowing: [],
      following: [],
      followers: [],
      balance: 150,
    };

    const userJunran = {
      firstname: "Junran",
      lastname: "Tao",
      username: "JunranTao",
      password: hashedPassword,
      admin: false,
      bio: "Junran Tao bio",
      conventionsAttending: [],
      bookmarks: [],
      likes: [],
      conventionsFollowing: [],
      following: [],
      followers: [],
      balance: 175,
    };

    const userHaolin = {
      firstname: "Haolin",
      lastname: "Chen",
      username: "HaolinChen",
      password: hashedPassword,
      admin: false,
      bio: "Haolin Chen bio",
      conventionsAttending: [],
      bookmarks: [],
      likes: [],
      conventionsFollowing: [],
      following: [],
      followers: [],
      balance: 190,
    };

    const userWeiTing = {
      firstname: "WeiTing",
      lastname: "Kuo",
      username: "WeiTingKuo",
      password: hashedPassword,
      admin: false,
      bio: "WeiTing Kuo bio",
      conventionsAttending: [],
      bookmarks: [],
      likes: [],
      conventionsFollowing: [],
      following: [],
      followers: [],
      balance: 165,
    };

    // Insert users directly to bypass validation for seeding
    const userCollection = await db.collection("users");

    const filipId = (await userCollection.insertOne(userFilip)).insertedId;
    const konstantinosId = (await userCollection.insertOne(userKonstantinos))
      .insertedId;
    const junranId = (await userCollection.insertOne(userJunran)).insertedId;
    const haolinId = (await userCollection.insertOne(userHaolin)).insertedId;
    const weitingId = (await userCollection.insertOne(userWeiTing)).insertedId;

    console.log("Users created.");

    // Create following relationships
    console.log("Creating following relationships...");

    // Filip follows Konstantinos and Junran
    await userCollection.updateOne(
      { _id: filipId },
      { $push: { following: { $each: [konstantinosId, junranId] } } }
    );

    // Update followers for Konstantinos and Junran
    await userCollection.updateOne(
      { _id: konstantinosId },
      { $push: { followers: filipId } }
    );

    await userCollection.updateOne(
      { _id: junranId },
      { $push: { followers: filipId } }
    );

    // Haolin follows Weiting
    await userCollection.updateOne(
      { _id: haolinId },
      { $push: { following: weitingId } }
    );

    // Update followers for Weiting
    await userCollection.updateOne(
      { _id: weitingId },
      { $push: { followers: haolinId } }
    );

    // Konstantinos follows Haolin
    await userCollection.updateOne(
      { _id: konstantinosId },
      { $push: { following: haolinId } }
    );

    // Update followers for Haolin
    await userCollection.updateOne(
      { _id: haolinId },
      { $push: { followers: konstantinosId } }
    );

    console.log("Following relationships created.");

    // Create conventions
    console.log("Creating conventions...");

    // Create a past convention (already ended)
    const pastConvention = {
      name: "Web Development Summit 2025",
      tags: ["Web", "Development", "JavaScript"],
      startDate: "2025-04-10T10:00:00.000Z",
      endDate: "2025-04-12T18:00:00.000Z",
      description:
        "A convention for web developers to share their knowledge and experience.",
      isOnline: false,
      address: "Tech Center, New York, NY",
      exclusive: false,
      owners: [filipId],
      panelists: [konstantinosId, junranId],
      attendees: [haolinId, weitingId],
      fundings:0
    };

    // Create an ongoing convention (happening now)
    const ongoingConvention = {
      name: "AI and Machine Learning Conference",
      tags: ["AI", "Machine Learning", "Data Science"],
      startDate: "2025-05-12T09:00:00.000Z",
      endDate: "2025-05-14T17:00:00.000Z",
      description: "Explore the latest trends in AI and Machine Learning.",
      isOnline: true,
      address: "", // Online convention
      exclusive: true,
      owners: [haolinId],
      panelists: [filipId],
      attendees: [konstantinosId, junranId, weitingId],
      fundings:0
    };

    // Create an upcoming convention
    const upcomingConvention = {
      name: "MongoDB Developers Conference",
      tags: ["MongoDB", "Database", "Backend"],
      startDate: "2025-06-15T10:00:00.000Z",
      endDate: "2025-06-17T16:00:00.000Z",
      description: "Learn about MongoDB best practices and new features.",
      isOnline: false,
      address: "Tech Hub, San Francisco, CA",
      exclusive: false,
      owners: [junranId, konstantinosId],
      panelists: [],
      attendees: [],
      fundings:0
    };

    // Insert conventions directly
    const conventionCollection = await db.collection("conventions");

    const pastConventionId = (
      await conventionCollection.insertOne(pastConvention)
    ).insertedId;
    const ongoingConventionId = (
      await conventionCollection.insertOne(ongoingConvention)
    ).insertedId;
    const upcomingConventionId = (
      await conventionCollection.insertOne(upcomingConvention)
    ).insertedId;

    // Update users with convention relationships
    // Filip is owner of past convention
    await userCollection.updateOne(
      { _id: filipId },
      { $push: { conventionsAttending: pastConventionId } }
    );

    // Konstantinos and Junran are panelists in past convention
    await userCollection.updateOne(
      { _id: konstantinosId },
      { $push: { conventionsAttending: pastConventionId } }
    );

    await userCollection.updateOne(
      { _id: junranId },
      { $push: { conventionsAttending: pastConventionId } }
    );

    // Haolin and Weiting are attendees in past convention
    await userCollection.updateOne(
      { _id: haolinId },
      { $push: { conventionsAttending: pastConventionId } }
    );

    await userCollection.updateOne(
      { _id: weitingId },
      { $push: { conventionsAttending: pastConventionId } }
    );

    // Haolin is owner of ongoing convention
    await userCollection.updateOne(
      { _id: haolinId },
      { $push: { conventionsAttending: ongoingConventionId } }
    );

    // Filip is panelist in ongoing convention
    await userCollection.updateOne(
      { _id: filipId },
      { $push: { conventionsAttending: ongoingConventionId } }
    );

    // Konstantinos, Junran, and Weiting are attendees in ongoing convention
    await userCollection.updateOne(
      { _id: konstantinosId },
      { $push: { conventionsAttending: ongoingConventionId } }
    );

    await userCollection.updateOne(
      { _id: junranId },
      { $push: { conventionsAttending: ongoingConventionId } }
    );

    await userCollection.updateOne(
      { _id: weitingId },
      { $push: { conventionsAttending: ongoingConventionId } }
    );

    // Junran and Konstantinos are owners of upcoming convention
    await userCollection.updateOne(
      { _id: junranId },
      { $push: { conventionsAttending: upcomingConventionId } }
    );

    await userCollection.updateOne(
      { _id: konstantinosId },
      { $push: { conventionsAttending: upcomingConventionId } }
    );

    // Filip is following the upcoming convention
    await userCollection.updateOne(
      { _id: filipId },
      { $push: { conventionsFollowing: upcomingConventionId } }
    );

    console.log("Conventions created.");

    // Create posts
    console.log("Creating posts...");

    // Posts with no convention association
    const post1 = {
      text: "Just joined the platform! Looking forward to connecting with everyone.",
      conventionID: "",
      userID: filipId,
      images: [],
      likes: [konstantinosId, haolinId],
      createdAt: new Date("2025-05-01T14:23:11.000Z"),
    };

    const post2 = {
      text: "Working on a new project using MongoDB and React. It's coming along nicely!",
      conventionID: "",
      userID: konstantinosId,
      images: [],
      likes: [filipId, junranId, weitingId],
      createdAt: new Date("2025-05-03T09:45:22.000Z"),
    };

    // Posts associated with conventions
    const post3 = {
      text: "Excited to be speaking at the Web Development Summit next week!",
      conventionID: pastConventionId,
      userID: junranId,
      images: [],
      likes: [filipId, konstantinosId],
      createdAt: new Date("2025-04-05T16:12:08.000Z"),
    };

    const post4 = {
      text: "Currently at the AI Conference. The keynote was amazing!",
      conventionID: ongoingConventionId,
      userID: haolinId,
      images: [],
      likes: [weitingId],
      createdAt: new Date("2025-05-12T11:37:14.000Z"),
    };

    const post5 = {
      text: "Looking forward to the MongoDB Conference next month. Who else is going?",
      conventionID: upcomingConventionId,
      userID: weitingId,
      images: [],
      likes: [],
      createdAt: new Date("2025-05-10T20:05:33.000Z"),
    };

    // Insert posts
    const postCollection = await db.collection("posts");

    const post1Id = (await postCollection.insertOne(post1)).insertedId;
    const post2Id = (await postCollection.insertOne(post2)).insertedId;
    const post3Id = (await postCollection.insertOne(post3)).insertedId;
    const post4Id = (await postCollection.insertOne(post4)).insertedId;
    const post5Id = (await postCollection.insertOne(post5)).insertedId;

    // Add bookmarks to users
    await userCollection.updateOne(
      { _id: haolinId },
      { $push: { bookmarks: post1Id } }
    );

    await userCollection.updateOne(
      { _id: filipId },
      { $push: { bookmarks: post4Id } }
    );

    console.log("Posts created.");

    // Create comments
    console.log("Creating comments...");

    const comment1 = {
      text: "Welcome to the platform! Glad to have you here.",
      postID: post1Id,
      userID: konstantinosId,
      createdAt: new Date("2025-05-01T15:10:22.000Z"),
      likes: [filipId],
    };

    const comment2 = {
      text: "Looking forward to seeing your project. What features are you implementing?",
      postID: post2Id,
      userID: filipId,
      createdAt: new Date("2025-05-03T10:15:43.000Z"),
      likes: [konstantinosId, junranId],
    };

    const comment3 = {
      text: "I'll be there! Looking forward to your talk.",
      postID: post3Id,
      userID: konstantinosId,
      createdAt: new Date("2025-04-05T17:05:18.000Z"),
      likes: [junranId],
    };

    const comment4 = {
      text: "What was the most interesting topic they covered?",
      postID: post4Id,
      userID: weitingId,
      createdAt: new Date("2025-05-12T12:22:35.000Z"),
      likes: [],
    };

    const comment5 = {
      text: "I'll definitely be attending. Let's meet up there!",
      postID: post5Id,
      userID: junranId,
      createdAt: new Date("2025-05-10T21:17:47.000Z"),
      likes: [weitingId],
    };

    // Insert comments
    const commentCollection = await db.collection("comments");

    await commentCollection.insertOne(comment1);
    await commentCollection.insertOne(comment2);
    await commentCollection.insertOne(comment3);
    await commentCollection.insertOne(comment4);
    await commentCollection.insertOne(comment5);

    console.log("Comments created.");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
};

// Export the function directly - no default export
export { seedDB };
