import express, { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import client from '../redis/client.js';

interface User {
  _id: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface Convention {
  _id: string;
  name: string;
  tags: string[];
  startDate: string;
  endDate: string;
  description?: string;
  isOnline: boolean;
  address: string;
  exclusive: boolean;
  owner: string;
  panelists: string[];
  attendees: string[];
}

const router: Router = express.Router();

const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  next();
};

// Create
router.post('/', ensureAuthenticated, async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { name, tags, startDate, endDate, description, isOnline, address, exclusive } = req.body;

  if (!name || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newConvention: Convention = {
    _id: uuidv4(),
    name,
    tags: tags || [],
    startDate,
    endDate,
    description: description || '',
    isOnline: !!isOnline,
    address: address || '',
    exclusive: !!exclusive,
    owner: req.user!._id,
    panelists: [],
    attendees: []
  };

  await client.del('conventions:all');
  return res.status(201).json({ success: true, data: newConvention });
});

// Get all
router.get('/', async (req: Request, res: Response): Promise<any> => {
  const cacheKey = 'conventions:all';
  const cached = await client.get(cacheKey);
  if (cached) {
    console.log('[Cache Hit] GET /conventions');
    return res.json({ success: true, data: JSON.parse(cached) });
  }

  // TODO: Replace with DB query
  const conventions: Convention[] = [];

  await client.set(cacheKey, JSON.stringify(conventions), { EX: 300 });
  return res.json({ success: true, data: conventions });
});

// Get one
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const cacheKey = `convention:${id}`;
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json({ success: true, data: JSON.parse(cached) });
  }

  // TODO: Replace with DB findById
  const foundConvention: Convention | null = null;

  if (!foundConvention) {
    return res.status(404).json({ error: 'Convention not found' });
  }

  await client.set(cacheKey, JSON.stringify(foundConvention), { EX: 300 });
  return res.json({ success: true, data: foundConvention });
});

// Update
router.put('/:id', ensureAuthenticated, async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const updates = req.body;

  // TODO: Fetch from DB
  const convention: Convention | null = null;

  if (!convention) return res.status(404).json({ error: 'Convention not found' });

  if ((convention as Convention).owner !== req.user!._id) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  const updatedConvention = { ...(convention as Convention), ...updates };
  

  await client.del('conventions:all');
  await client.del(`convention:${id}`);
  return res.json({ success: true, data: updatedConvention });
});

// Delete
router.delete('/:id', ensureAuthenticated, async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  // TODO: Fetch from DB
  const convention: Convention | null = null;

  if (!convention) return res.status(404).json({ error: 'Convention not found' });

  if ((convention as Convention).owner !== req.user!._id) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  // TODO: Delete from DB

  await client.del('conventions:all');
  await client.del(`convention:${id}`);
  return res.json({ success: true, message: 'Convention deleted' });
});

export default router;