import { createClient } from "redis";

let client: any;

if (process.env.UPSTASH_REDIS_REST_TOKEN) {
  // For Upstash Redis (Vercel deployment)
  const { Redis } = require('@upstash/redis');
  
  client = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  
  console.log("Using Upstash Redis client");
} else {
  // For local development
  client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  client.on("error", (err: Error) => {
    console.error("Redis client error:", err);
  });

  client.on("connect", () => {
    console.log("Redis connected");
  });

  client.connect();
  console.log("Using standard Redis client");
}

export default client;
