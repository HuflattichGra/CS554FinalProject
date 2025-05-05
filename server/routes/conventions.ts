import express, { Request, Response, Router } from 'express';
import { ObjectId } from 'mongodb';
import conventionFunctions from '../src/conventions.js';
import { checkId } from '../typechecker.js';
import redis from 'redis';
const client = redis.createClient();
client.connect().then(() => {});
const router: Router = express.Router();

// Create Convention
router.post('/', async (req: Request, res: Response):Promise<any> =>  {
  try {
    const { name, tags, startDate, endDate, description, isOnline, address, exclusive, ownerIds } = req.body;

    const newConvention = await conventionFunctions.createConvention(
      name,
      tags,
      startDate,
      endDate,
      description,
      isOnline,
      address,
      exclusive,
      ownerIds
    );
    await client.del('conventions:all');
    return res.status(201).json(newConvention);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});

// Get Convention by ID
router.get('/:id', async (req: Request, res: Response):Promise<any> => {
  try {
    const id = checkId(req.params.id, 'Convention ID');
    const cacheKey = `convention:${id}`;

    const cached = await client.get(cacheKey);
    if (cached) {
      console.log(`[Cache Hit] Convention ${id}`);
      return res.status(200).json(JSON.parse(cached));
    }

    const convention = await conventionFunctions.getConventionById(id);
    await client.set(cacheKey, JSON.stringify(convention), { EX: 300 });

    return res.status(200).json(convention);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
//Get All Conventions
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const cacheKey = `conventions:page:${page}:size:${pageSize}`;
    const cached = await client.get(cacheKey);

    if (cached) {
      console.log(`[Cache Hit] Conventions Page ${page}`);
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await conventionFunctions.getAllConventions(page, pageSize);

    await client.set(cacheKey, JSON.stringify(result), { EX: 300 });

    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
// Update Convention
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const convention = await conventionFunctions.getConventionById(id);
    const ownerIds = convention.owners.map((id: any) => id.toString());

    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can edit convention' });
    }

    const updates = req.body;
    const updatedConvention = await conventionFunctions.updateConvention(id, updates);

    await client.del('conventions:all');
    await client.del(`convention:${id}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});

// Delete Convention
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const convention = await conventionFunctions.getConventionById(id);
    const ownerIds = convention.owners.map((id: any) => id.toString());

    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can delete convention' });
    }

    const deletionResult = await conventionFunctions.deleteConvention(id);

    await client.del('conventions:all');
    await client.del(`convention:${id}`);
    return res.status(200).json(deletionResult);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});

// Add Owner
router.patch('/:id/addOwner', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());

    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can add owners' });
    }

    const { ownerId } = req.body;
    const checkedOwnerId = checkId(ownerId, 'Owner ID');

    const updatedConvention = await conventionFunctions.addOwner(conventionId, checkedOwnerId);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
// Remove Owner
router.patch('/:id/removeOwner', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const { ownerId } = req.body;
    const checkedOwnerId = checkId(ownerId, 'Owner ID');

    const updatedConvention = await conventionFunctions.removeOwner(conventionId, checkedOwnerId);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);

    return res.status(200).json(updatedConvention);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});

router.get('/:id/panelists', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');

    const convention = await conventionFunctions.getConventionById(conventionId);

    return res.status(200).json({ panelists: convention.panelists || [] });
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
// Add Panelist
router.patch('/:id/addPanelist', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());

    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can add panelists' });
    }

    const { panelistId } = req.body;
    const checkedPanelistId = checkId(panelistId, 'Panelist ID');

    const updatedConvention = await conventionFunctions.addPanelist(conventionId, checkedPanelistId);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});

// Remove a Panelist
router.patch('/:id/removePanelist', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());

    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can remove panelists' });
    }

    const { panelistId } = req.body;
    const checkedPanelistId = checkId(panelistId, 'Panelist ID');

    const updatedConvention = await conventionFunctions.removePanelist(conventionId, checkedPanelistId);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});

// User apply to become Panelist
router.patch('/:id/applyPanelist', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const updatedConvention = await conventionFunctions.applyPanelist(conventionId, user._id);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});

// Approve a Panelist application
router.patch('/:id/approvePanelist', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());

    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can approve panelists' });
    }

    const { applicantId } = req.body;
    const checkedApplicantId = checkId(applicantId, 'Applicant ID');

    const updatedConvention = await conventionFunctions.approvePanelistApplication(conventionId, checkedApplicantId);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
router.patch('/:id/rejectPanelist', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;
    if (!user || !user._id) return res.status(401).json({ error: 'User not logged in' });

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());
    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can reject panelists' });
    }

    const { applicantId } = req.body;
    const checkedApplicantId = checkId(applicantId, 'Applicant ID');

    const updatedConvention = await conventionFunctions.rejectPanelistApplication(conventionId, checkedApplicantId);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
router.get('/:id/panelistApplications', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;
    if (!user || !user._id) return res.status(401).json({ error: 'User not logged in' });

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());
    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can view panelist applications' });
    }

    return res.status(200).json({ panelistApplications: convention.panelistApplications || [] });
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
//Apple Attendee
router.patch('/:id/applyAttendee', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;
    if (!user || !user._id) return res.status(401).json({ error: 'User not logged in' });

    const updatedConvention = await conventionFunctions.applyAttendee(conventionId, user._id);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
router.patch('/:id/approveAttendee', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;
    if (!user || !user._id) return res.status(401).json({ error: 'User not logged in' });

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());
    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can approve attendees' });
    }

    const { applicantId } = req.body;
    const checkedApplicantId = checkId(applicantId, 'Applicant ID');

    const updatedConvention = await conventionFunctions.approveAttendeeApplication(conventionId, checkedApplicantId);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
router.patch('/:id/removeAttendee',async (req: Request, res: Response) => { 
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());
    
    const { applicantId } = req.body;

    if (!applicantId.includes(user._id.toString()) && !ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only convention owners, admins, or the attendee themself can remove an attendee' });
    }

    const checkedApplicantId = checkId(applicantId, 'Panelist ID');

    const updatedConvention = await conventionFunctions.removeAttendee(conventionId, checkedApplicantId);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});

router.patch('/:id/rejectAttendee', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;
    if (!user || !user._id) return res.status(401).json({ error: 'User not logged in' });

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());
    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can reject attendees' });
    }

    const { applicantId } = req.body;
    const checkedApplicantId = checkId(applicantId, 'Applicant ID');

    const updatedConvention = await conventionFunctions.rejectAttendeeApplication(conventionId, checkedApplicantId);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    return res.status(200).json(updatedConvention);
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
router.get('/:id/attendees', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');

    const attendees = await conventionFunctions.listAttendees(conventionId);

    return res.status(200).json({ attendees });
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
router.get('/:id/attendeeApplications', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;
    if (!user || !user._id) return res.status(401).json({ error: 'User not logged in' });

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());

    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can view attendee applications' });
    }

    const attendeeApplications = await conventionFunctions.listAttendeeApplications(conventionId);

    return res.status(200).json({ attendeeApplications });
  } catch (e) {
      return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
export default router;
