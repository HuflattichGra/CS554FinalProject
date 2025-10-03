// Debug API handler
export default function handler(req, res) {
  console.log('Debug API called:', req.url, req.method);
  console.log('Query:', req.query);
  
  return res.status(200).json({
    message: 'Debug API working',
    url: req.url,
    method: req.method,
    query: req.query,
    timestamp: new Date().toISOString()
  });
}