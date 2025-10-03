export default async function handler(req: any, res: any) {
  try {
    // Dynamic import to resolve ERR_REQUIRE_ESM in Vercel environment
    const { default: app } = await import('../server/vercel.js');
    
    // Call the Express app with the request and response
    return app(req, res);
  } catch (error) {
    console.error('Failed to load Express app:', error);
    return res.status(500).json({
      error: 'Failed to initialize server',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}