import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
