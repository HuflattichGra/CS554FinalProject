import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import configRoutes from "./routes/index";
import { ensureUploadDirExists } from "./images";
import { seedDB } from "./seed.js";

const app = express();
// app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://client:5173"],
    credentials: true,
  })
);

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});

app.use(
  session({
    name: "AuthenticationState",
    secret: "some secret string!",
    resave: false,
    saveUninitialized: false,
  })
);

ensureUploadDirExists();

configRoutes(app);

// Check if SEED_DB environment variable is set to true
const shouldSeedDB = process.env.SEED_DB === "true";

app.listen(3000, async () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");

  // Seed the database if SEED_DB is true
  if (shouldSeedDB) {
    try {
      console.log("Seeding database...");
      await seedDB();
      console.log("Database seeded successfully!");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
});
