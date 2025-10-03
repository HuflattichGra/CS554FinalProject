import app from '../server/vercel.js';

// Debug wrapper to understand what's happening
export default function handler(req: any, res: any) {
  console.log('API slug handler called:', req.url, req.method);
  console.log('Query params:', req.query);
  
  // Call the Express app
  return app(req, res);
}