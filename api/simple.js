// 简化的 API 处理器，避开 TypeScript 编译问题
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  
  const db = client.db(process.env.MONGO_DB || 'DucKnight-CS554-Final');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    
    // 简单的路由处理
    if (req.url === '/api/posts' && req.method === 'GET') {
      const posts = await db.collection('posts').find({}).limit(10).toArray();
      return res.status(200).json(posts);
    }
    
    if (req.url === '/api/checkSession' && req.method === 'GET') {
      return res.status(200).json({ user: null });
    }
    
    return res.status(404).json({ error: 'Route not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}