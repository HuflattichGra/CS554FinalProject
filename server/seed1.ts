import { ObjectId } from 'mongodb';
import { dbConnection } from "./config/mongoConnection";
import { users, posts, comments, conventions } from "./config/mongoCollections";
import bcrypt from "bcrypt";

async function seed1() {
    try {
        const db = await dbConnection();
        
        // Clear existing collections
        await db.collection('users').deleteMany({});
        await db.collection('posts').deleteMany({});
        await db.collection('comments').deleteMany({});
        await db.collection('conventions').deleteMany({});

        // Create test users
        const hashedPassword = await bcrypt.hash("Stevens@123!", 10);
        const testUsers = [
            {
                _id: new ObjectId(),
                username: "test1",
                firstname: "Test",
                lastname: "User1",
                password: hashedPassword,
                admin: false,
                bio: "This is test user 1's bio",
                pfp: "",
                conventionsAttending: [],
                bookmarks: [],
                likes: [],
                conventionsFollowing: [],
                following: [],
                followers: [],
                balance: 100.00
            },
            {
                _id: new ObjectId(),
                username: "testuser2",
                firstname: "Test",
                lastname: "User2",
                password: hashedPassword,
                admin: false,
                bio: "This is test user 2's bio",
                pfp: "",
                conventionsAttending: [],
                bookmarks: [],
                likes: [],
                conventionsFollowing: [],
                following: [],
                followers: [],
                balance: 50.00
            },
            {
                _id: new ObjectId(),
                username: "admin",
                firstname: "Admin",
                lastname: "User",
                password: hashedPassword,
                admin: true,
                bio: "This is the admin user",
                pfp: "",
                conventionsAttending: [],
                bookmarks: [],
                likes: [],
                conventionsFollowing: [],
                following: [],
                followers: [],
                balance: 1000.00
            }
        ];

        // Insert users
        const usersCollection = await users();
        const insertedUsers = await usersCollection.insertMany(testUsers);
        console.log("Users seeded successfully");

        // Create test conventions
        const testConventions = [
            {
                _id: new ObjectId(),
                name: "Test Convention 1",
                description: "This is a test convention",
                startDate: new Date("2024-06-01"),
                endDate: new Date("2024-06-03"),
                location: "Test Location 1",
                price: 50.00,
                tags: ["test", "convention"],
                attendees: [insertedUsers.insertedIds[0].toString()],
                posts: []
            },
            {
                _id: new ObjectId(),
                name: "Test Convention 2",
                description: "This is another test convention",
                startDate: new Date("2024-07-01"),
                endDate: new Date("2024-07-05"),
                location: "Test Location 2",
                price: 75.00,
                tags: ["test", "convention"],
                attendees: [insertedUsers.insertedIds[1].toString()],
                posts: []
            }
        ];

        // Insert conventions
        const conventionsCollection = await conventions();
        const insertedConventions = await conventionsCollection.insertMany(testConventions);
        console.log("Conventions seeded successfully");

        // Create test posts
        const testPosts = [
            {
                _id: new ObjectId(),
                conventionID: insertedConventions.insertedIds[0].toString(),
                userID: insertedUsers.insertedIds[0].toString(),
                text: "This is a test post from user 1",
                images: [],
                likes: [insertedUsers.insertedIds[1].toString()],
                createdAt: new Date()
            },
            {
                _id: new ObjectId(),
                conventionID: insertedConventions.insertedIds[1].toString(),
                userID: insertedUsers.insertedIds[1].toString(),
                text: "This is a test post from user 2",
                images: [],
                likes: [],
                createdAt: new Date()
            }
        ];

        // Insert posts
        const postsCollection = await posts();
        const insertedPosts = await postsCollection.insertMany(testPosts);
        console.log("Posts seeded successfully");

        // Create test comments
        const testComments = [
            {
                _id: new ObjectId(),
                postID: insertedPosts.insertedIds[0].toString(),
                userID: insertedUsers.insertedIds[1].toString(),
                text: "This is a test comment from user 2",
                createdAt: new Date(),
                likes: []
            },
            {
                _id: new ObjectId(),
                postID: insertedPosts.insertedIds[1].toString(),
                userID: insertedUsers.insertedIds[0].toString(),
                text: "This is a test comment from user 1",
                createdAt: new Date(),
                likes: []
            }
        ];

        // Insert comments
        const commentsCollection = await comments();
        await commentsCollection.insertMany(testComments);
        console.log("Comments seeded successfully");

        // Update user following relationships
        await usersCollection.updateOne(
            { _id: insertedUsers.insertedIds[0] },
            { $set: { following: [insertedUsers.insertedIds[1].toString()] } }
        );
        await usersCollection.updateOne(
            { _id: insertedUsers.insertedIds[1] },
            { $set: { followers: [insertedUsers.insertedIds[0].toString()] } }
        );

        console.log("Database seeded successfully!");
        await db.close();
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

seed1(); 