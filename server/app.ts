import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import configRoutes from "./routes/index";
import { ensureUploadDirExists } from "./images";

const app = express();
// app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
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

app.listen(3000, async () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
