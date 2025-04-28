import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on("error", (err: Error) => {
  console.error(" Redis client error:", err);
});

client.on("connect", () => {
  console.log(" Redis connected");
});

client.connect();

export default client;
