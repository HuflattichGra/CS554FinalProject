import express, { Request, Response, Router } from 'express';
import conventionFunctions from '../src/conventions.js';
import { checkId } from '../typechecker.js';
import client from "../redis/client.js";

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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
  }
});

router.get('/:id/panelists', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');

    const convention = await conventionFunctions.getConventionById(conventionId);

    return res.status(200).json({ panelists: convention.panelists || [] });
  } catch (e) {
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
  }
});
router.get('/:id/attendees', async (req: Request, res: Response) => {
  try {
    const conventionId = checkId(req.params.id, 'Convention ID');

    const attendees = await conventionFunctions.listAttendees(conventionId);

    return res.status(200).json({ attendees });
  } catch (e) {
    return res.status(400).json({ error: e });
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
    return res.status(400).json({ error: e });
  }
});
export default router;
