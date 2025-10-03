import { createClient } from "redis";
import { Redis } from '@upstash/redis';

let client: any;
let isUpstash = false;

if (process.env.UPSTASH_REDIS_REST_TOKEN) {
  // For Upstash Redis (Vercel deployment)
  client = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  
  isUpstash = true;
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

// Helper function to parse data from Redis consistently
export function parseRedisData(data: any): any {
  if (data === null || data === undefined) return null;
  
  if (isUpstash) {
    // Upstash Redis returns parsed objects directly
    return data;
  } else {
    // Standard Redis returns strings that need parsing
    return typeof data === 'string' ? JSON.parse(data) : data;
  }
}

export default client;
