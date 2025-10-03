import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import configRoutes from "./routes/index";
import { ensureUploadDirExists } from "./images";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.VERCEL_URL 
      : ["http://localhost:5173", "http://client:5173"],
    credentials: true,
  })
);

app.use(
  session({
    name: "AuthenticationState",
    secret: process.env.SESSION_SECRET || "some secret string!",
    resave: false,
    saveUninitialized: false,
  })
);

// For Vercel, we need to handle uploads differently
try {
  ensureUploadDirExists();
} catch (error) {
  console.warn("Upload directory creation failed, this is expected on Vercel:", error);
}

configRoutes(app);

// For Vercel serverless functions
export default app;