import express, { Request, Response, Router } from 'express';
import conventionFunctions from '../src/conventions.js';
import { checkId } from '../typechecker.js';
import { validateConventionFields } from '../validation/conventionValidation';
import client from "../redis/client.js";
import { users } from '../config/mongoCollections';

const router: Router = express.Router();

// Create Convention
router.post('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validateConventionFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }

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

    if (!name || typeof name !== 'string') throw 'Name is required and must be a string';
    if (!Array.isArray(tags)) throw 'Tags must be an array';
    if (!startDate || typeof startDate !== 'string') throw 'Start date is required';
    if (!endDate || typeof endDate !== 'string') throw 'End date is required';
    if (!ownerIds || !Array.isArray(ownerIds) || ownerIds.length === 0) throw 'At least one ownerId is required';

    await client.del('conventions:all');
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return res.status(201).json(newConvention);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});

// Get Convention by ID
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const id = checkId(req.params.id, 'Convention ID');
    const cacheKey = `convention:${id}`;

    const cached = await client.get(cacheKey);
    if (cached) {
      // console.log(`[Cache Hit] Convention ${id}`);
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
    const errors = validateConventionFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }
    const updates = req.body;
    const unchanged = Object.entries(updates).every(([key, value]) => {
      return JSON.stringify(value) === JSON.stringify(convention[key]);
    });
    
    if (unchanged) {
      return res.status(200).json({ message: 'No changes detected', data: convention });
    }
    const updatedConvention = await conventionFunctions.updateConvention(id, updates);

    await client.del('conventions:all');
    await client.del(`convention:${id}`);
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
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

    await client.del(`convention:${id}`);
    await client.del('conventions:all');
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }

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
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
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
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
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
    if (!panelistId || typeof panelistId !== 'string') {
      return res.status(400).json({ error: 'Panelist username must be a non-empty string' });
    }

    const userCollection = await users();
    const panelistUser = await userCollection.findOne({ username: panelistId.trim() });

    if (!panelistUser) {
      return res.status(404).json({ error: 'Panelist user not found' });
    }

    const updatedConvention = await conventionFunctions.addPanelist(
      conventionId,
      panelistUser._id.toString()
    );

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return res.status(200).json(updatedConvention);
  } catch (e) {
    console.error('[addPanelist error]', e);
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
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
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
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
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
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return res.status(200).json(updatedConvention);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
router.patch('/:id/addAttendee', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());

    if (!ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only owners or admins can add attendees' });
    }

    const { attendeeId } = req.body;
    if (!attendeeId || typeof attendeeId !== 'string') {
      return res.status(400).json({ error: 'Attendee username must be a non-empty string' });
    }

    const userCollection = await users();
    const attendeeUser = await userCollection.findOne({ username: attendeeId.trim() });

    if (!attendeeUser) {
      return res.status(404).json({ error: 'Attendee user not found' });
    }

    const updatedConvention = await conventionFunctions.approveAttendeeApplication(
      conventionId,
      attendeeUser._id.toString()
    );

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }

    return res.status(200).json(updatedConvention);
  } catch (e) {
    console.error('[addAttendee error]', e);
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
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
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
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return res.status(200).json(updatedConvention);
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
      return res.status(403).json({ error: 'Only owners or admins can view applications' });
    }

    const applications = await conventionFunctions.getAllAttendeeApplication(conventionId);
    return res.status(200).json(applications);
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
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return res.status(200).json(updatedConvention);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
router.patch('/:id/removeAttendee', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;

    if (!user || !user._id) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    const convention = await conventionFunctions.getConventionById(conventionId);
    const ownerIds = convention.owners.map((id: any) => id.toString());

    const { attendeeId } = req.body;

    if (!attendeeId.includes(user._id.toString()) && !ownerIds.includes(user._id.toString()) && !user.admin) {
      return res.status(403).json({ error: 'Only convention owners, admins, or the attendee themself can remove an attendee' });
    }

    const checkedApplicantId = checkId(attendeeId, 'Panelist ID');

    const updatedConvention = await conventionFunctions.removeAttendee(conventionId, checkedApplicantId);

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
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
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return res.status(200).json(updatedConvention);
  } catch (e) {
    return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
  }
});
router.patch('/:id/cancelAttendeeApplication', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');
    const user = req.session?.user;
    if (!user || !user._id) return res.status(401).json({ error: 'Not logged in' });

    const updatedConvention = await conventionFunctions.rejectAttendeeApplication(conventionId, user._id); // ✅ 重用已有函数

    await client.del('conventions:all');
    await client.del(`convention:${conventionId}`);
    const keys = await client.keys('conventions:page:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
    return res.status(200).json(updatedConvention);
  } catch (e) {
    return res.status(400).json({ error: e?.toString?.() || 'Unknown Error' });
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
// router.get('/:id/attendeeApplications', async (req: Request, res: Response) => {
//   try {
//     const conventionId = checkId(req.params.id, 'Convention ID');
//     const user = req.session?.user;
//     // if (!user || !user._id) return res.status(401).json({ error: 'User not logged in' });

//     const convention = await conventionFunctions.getConventionById(conventionId);
//     const ownerIds = convention.owners.map((id: any) => id.toString());

//     if (!ownerIds.includes(user._id.toString()) && !user.admin) {
//       // return res.status(403).json({ error: 'Only owners or admins can view attendee applications' });
//     }

//     const attendeeApplications = await conventionFunctions.listAttendeeApplications(conventionId);

//     return res.status(200).json({ attendeeApplications });
//   } catch (e) {
//       return res.status(400).json({ error: e?.toString() || 'Unknown Error' });
//   }
// });
router.get('/user/:userId/bookmarked', async (req: Request, res: Response) => {
  try {
    const data = await conventionFunctions.getUserBookmarkedConventions(req.params.userId);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});
router.get('/user/:userId/recommended', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await conventionFunctions.getRecommendedConventions(userId, page, pageSize);

    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }
});


export default router;
