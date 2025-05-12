import { users, conventions } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { checkStringTrimmed, checkId, checkDate } from '../typechecker.js';

function calculateCountdownDays(startDate: string): number {
  if (!startDate) return 0;

  const now = new Date();
  const start = new Date(startDate);

  const diffTime = start.getTime() - now.getTime();

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(diffDays, 0); 
}


// Create Convention
export const createConvention = async (
  name: string,
  tags: string[],
  startDate: string,
  endDate: string,
  description: string,
  isOnline: boolean,
  address: string,
  exclusive: boolean,
  ownerIds: string[]
) => {
  name = checkStringTrimmed(name, 'Convention Name');
  if (name.length < 3) throw 'Convention name must be at least 3 characters long';
  if (name.length > 100) throw 'Convention name must be less than 100 characters';

  if (!Array.isArray(tags)) throw 'Tags must be an array of strings';
  if (tags.length === 0) throw 'At least one tag is required';
  tags = tags.map((tag) => checkStringTrimmed(tag, 'Tag'));

  startDate = checkDate(startDate, 'Start Date');
  endDate = checkDate(endDate, 'End Date');

  description = checkStringTrimmed(description, 'Description');
  address = checkStringTrimmed(address, 'Address');

  if (ownerIds.length === 0) throw 'At least one owner is required';
  
  const owners = ownerIds.map((id) => new ObjectId(checkId(id, 'Owner ID')));

  const conventionCollection = await conventions();
  const newConvention = {
    name,
    tags,
    startDate,
    endDate,
    description,
    isOnline,
    address,
    exclusive,
    owners,
    panelists: [],
    attendees: []
  };

  const insertInfo = await conventionCollection.insertOne(newConvention);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Failed to create convention';

  return {
    _id: insertInfo.insertedId,
    ...newConvention
  };
};

// Get Convention By Id
export const getConventionById = async (id: string) => {
  id = checkId(id, 'Convention ID');

  const conventionCollection = await conventions();
  const userCollection = await users();
  const convention = await conventionCollection.findOne({ _id: new ObjectId(id) });

  if (!convention) throw 'Convention not found';
  let populatedPanelists = [];
  if (Array.isArray(convention.panelists) && convention.panelists.length > 0) {
    populatedPanelists = await userCollection
      .find({ _id: { $in: convention.panelists } })
      .project({ _id: 1, username: 1 })
      .toArray();
  }
let populatedOwners = [];
if (Array.isArray(convention.owners) && convention.owners.length > 0) {
  populatedOwners = await userCollection
    .find({ _id: { $in: convention.owners } })
    .project({ _id: 1, username: 1 })
    .toArray();
}
// console.log('panelist raw ids:', convention.panelists);
// console.log('matched panelists:', populatedPanelists);

let populatedAttendees = [];
if (Array.isArray(convention.attendees) && convention.attendees.length > 0) {
  populatedAttendees = await userCollection
    .find({ _id: { $in: convention.attendees } })
    .project({ _id: 1, username: 1 })
    .toArray();
}

  return {
    _id: convention._id,
    name: convention.name,
    tags: convention.tags,
    startDate: convention.startDate,
    endDate: convention.endDate,
    description: convention.description,
    isOnline: convention.isOnline,
    address: convention.address,
    exclusive: convention.exclusive,
    owners: convention.owners,
    panelists: populatedPanelists|| [], 
    attendees: convention.attendees
  };
};
//Get All Convention
export const getAllConventions = async (page: number, pageSize: number) => {
  const conventionCollection = await conventions();

  const total = await conventionCollection.countDocuments();
  const totalPages = Math.ceil(total / pageSize);

  const conventionList = await conventionCollection.find({})
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

    return {
      conventions: conventionList.map(c => ({
        _id: c._id.toString(),
        name: c.name || '',
        tags: c.tags ?? [],
        startDate: c.startDate || '',
        endDate: c.endDate || '',
        description: c.description || '',
        isOnline: c.isOnline ?? false,
        address: c.address || '',
        exclusive: c.exclusive ?? false,
        owners: Array.isArray(c.owners) ? c.owners.map(o => o.toString()) : [],
        panelists: Array.isArray(c.panelists) ? c.panelists.map(p => p.toString()) : [],
        attendees: Array.isArray(c.attendees) ? c.attendees.map(a => a.toString()) : [],
        panelistApplications: Array.isArray(c.panelistApplications) ? c.panelistApplications.map(p => p.toString()) : [],
        attendeeApplications: Array.isArray(c.attendeeApplications) ? c.attendeeApplications.map(a => a.toString()) : [],
        imageUrl: c.imageUrl || '/default-convention-banner.png',
        productCount: c.productCount ?? 0,
        groupCount: c.groupCount ?? 0,
        countdownDays: calculateCountdownDays(c.startDate)
      })),
      total,
      page,
      pageSize,
      totalPages
    };
    
};
// Update Convention
export const updateConvention = async (
  id: string,
  updates: {
    name?: string;
    tags?: string[];
    startDate?: string;
    endDate?: string;
    description?: string;
    isOnline?: boolean;
    address?: string;
    exclusive?: boolean;
  }
) => {
  id = checkId(id, 'Convention ID');

  const conventionCollection = await conventions();
  const updateData: any = {};

  if (updates.name !== undefined) {
    updateData.name = checkStringTrimmed(updates.name, 'Convention Name');
  }
  if (updates.tags !== undefined) {
    if (!Array.isArray(updates.tags)) throw 'Tags must be an array of strings';
    updateData.tags = updates.tags.map((tag) => checkStringTrimmed(tag, 'Tag'));
  }
  if (updates.startDate !== undefined) {
    updateData.startDate = checkDate(updates.startDate, 'Start Date');
  }
  if (updates.endDate !== undefined) {
    updateData.endDate = checkDate(updates.endDate, 'End Date');
  }
  if (updates.description !== undefined) {
    updateData.description = checkStringTrimmed(updates.description, 'Description');
  }
  if (updates.isOnline !== undefined) {
    if (typeof updates.isOnline !== 'boolean') throw 'isOnline must be a boolean';
    updateData.isOnline = updates.isOnline;
  }
  if (updates.address !== undefined) {
    updateData.address = checkStringTrimmed(updates.address, 'Address');
  }
  if (updates.exclusive !== undefined) {
    if (typeof updates.exclusive !== 'boolean') throw 'exclusive must be a boolean';
    updateData.exclusive = updates.exclusive;
  }

  const updateResult = await conventionCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  if (updateResult.matchedCount === 0) throw 'Convention not found';
  if (updateResult.modifiedCount === 0) throw 'No changes were made';

  return await getConventionById(id);
};

// Delete Convention
export const deleteConvention = async (id: string) => {
  id = checkId(id, 'Convention ID');

  const conventionCollection = await conventions();
  const deleteResult = await conventionCollection.deleteOne({ _id: new ObjectId(id) });

  if (deleteResult.deletedCount === 0) throw 'Convention not found or already deleted';

  return { deleted: true };
};

// Add Owner
export const addOwner = async (conventionId: string, ownerId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    ownerId = checkId(ownerId, 'Owner ID');
  
    const conventionCollection = await conventions();
    const updateResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      { $addToSet: { owners: new ObjectId(ownerId) } }  
    );
  
    if (updateResult.matchedCount === 0) throw 'Convention not found';
    if (updateResult.modifiedCount === 0) throw 'Owner already exists';
  
    return await getConventionById(conventionId);
  };
  
  // Remove Owner
  export const removeOwner = async (conventionId: string, ownerId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    ownerId = checkId(ownerId, 'Owner ID');
  
    const conventionCollection = await conventions();
    const updateResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      { $pull: { owners: new ObjectId(ownerId) } }
    );
  
    if (updateResult.matchedCount === 0) throw 'Convention not found';
    if (updateResult.modifiedCount === 0) throw 'Owner was not associated with this convention';
  
    return await getConventionById(conventionId);
  };
  
// Add Panelist
export const addPanelist = async (conventionId: string, panelistId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    panelistId = checkId(panelistId, 'Panelist ID');
  
    const conventionCollection = await conventions();
    const updateResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      { $addToSet: { panelists: new ObjectId(panelistId) } } 
    );
  
    if (updateResult.matchedCount === 0) throw 'Convention not found';
    if (updateResult.modifiedCount === 0) throw 'Panelist already exists';
  
    return await getConventionById(conventionId);
  };
  
  // Remove Panelist
  export const removePanelist = async (conventionId: string, panelistId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    panelistId = checkId(panelistId, 'Panelist ID');
  
    const conventionCollection = await conventions();
    const updateResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      { $pull: { panelists: new ObjectId(panelistId) } }
    );
  
    if (updateResult.matchedCount === 0) throw 'Convention not found';
    if (updateResult.modifiedCount === 0) throw 'Panelist was not associated with this convention';
  
    return await getConventionById(conventionId);
  };
  
  // Apply Panelist
  export const applyPanelist = async (conventionId: string, userId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    userId = checkId(userId, 'User ID');
  
    const conventionCollection = await conventions();
    const convention = await conventionCollection.findOne({ _id: new ObjectId(conventionId) });
    if (!convention) throw 'Convention not found';
    if (convention.panelists.map((id: any) => id.toString()).includes(userId)) {
        throw 'Already a panelist';
      }
    const updateResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      { $addToSet: { panelistApplications: new ObjectId(userId) } } 
    );
  
    if (updateResult.matchedCount === 0) throw 'Convention not found';
    if (updateResult.modifiedCount === 0) throw 'Already applied as panelist';
  
    return await getConventionById(conventionId);
  };
  
  // Approal Panelist
  export const approvePanelistApplication = async (conventionId: string, userId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    userId = checkId(userId, 'User ID');
  
    const conventionCollection = await conventions();
  
    const addPanelistResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      {
        $addToSet: { panelists: new ObjectId(userId) },
        $pull: { panelistApplications: new ObjectId(userId) }
      }
    );
  
    if (addPanelistResult.matchedCount === 0) throw 'Convention not found';
    if (addPanelistResult.modifiedCount === 0) throw 'Approval failed';
  
    return await getConventionById(conventionId);
  };
  export const rejectPanelistApplication = async (conventionId: string, userId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    userId = checkId(userId, 'User ID');
  
    const conventionCollection = await conventions();
    const updateResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      { $pull: { panelistApplications: new ObjectId(userId) } }
    );
  
    if (updateResult.matchedCount === 0) throw 'Convention not found';
    if (updateResult.modifiedCount === 0) throw 'No such panelist application';
  
    return await getConventionById(conventionId);
  };

 //Apple Attendee
export const applyAttendee = async (conventionId: string, userId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    userId = checkId(userId, 'User ID');
  
    const conventionCollection = await conventions();
    const convention = await conventionCollection.findOne({ _id: new ObjectId(conventionId) });
    if (!convention) throw 'Convention not found';
  
    if (convention.attendees.map((id: any) => id.toString()).includes(userId)) {
      throw 'Already an attendee';
    }
  
    // if (convention.exclusive) {
    //   const isAlreadyApplied = (convention.attendeeApplications || []).map((id: any) => id.toString()).includes(userId);
    //   console.log('Already applied?', isAlreadyApplied, 'userId:', userId);
    //   if (isAlreadyApplied) {
    //     await conventionCollection.updateOne(
    //       { _id: new ObjectId(conventionId) },
    //       { $pull: { attendeeApplications: new ObjectId(userId) } }
    //     );
    //   } else {
    //     await conventionCollection.updateOne(
    //       { _id: new ObjectId(conventionId) },
    //       { $addToSet: { attendeeApplications: new ObjectId(userId) } }
    //     );
    //   }
    // } else {
    //   // not exclusive attendees
    //   const updateResult = await conventionCollection.updateOne(
    //     { _id: new ObjectId(conventionId) },
    //     { $addToSet: { attendees: new ObjectId(userId) } }
    //   );
    //   if (updateResult.modifiedCount === 0) throw 'Already joined';
    // }
    const updateResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      { $addToSet: { attendees: new ObjectId(userId) } }
    );
    if (updateResult.modifiedCount === 0) throw 'Already joined';
  
    return await getConventionById(conventionId);
  };
  //Remove attendee
  export const removeAttendee = async (conventionId: string, userId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    userId = checkId(userId, 'User ID');  
    
    const conventionCollection = await conventions();
    const convention = await conventionCollection.findOne({ _id: new ObjectId(conventionId) });
    if (!convention) throw 'Convention not found';
    const updateResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      { $pull: { attendees: new ObjectId(userId) } }
    );
  
    if (updateResult.matchedCount === 0) throw 'Convention not found';
    if (updateResult.modifiedCount === 0) throw 'Attendee was not in this convention';
  
    return await getConventionById(conventionId);
  };
  export const getAllAttendeeApplication = async (conventionId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    const conventionCollection = await conventions();
  
    const convention = await conventionCollection.findOne(
      { _id: new ObjectId(conventionId) },
      { projection: { attendeeApplications: 1 } }
    );
  
    if (!convention) throw 'Convention not found';
 
    const userCollection = await users(); 
    const applicants = await userCollection
      .find({ _id: { $in: convention.attendeeApplications || [] } })
      .project({ username: 1, email: 1 }) 
      .toArray();
  
    return applicants;
  };
  
  // Approve attendee
  export const approveAttendeeApplication = async (conventionId: string, userId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    userId = checkId(userId, 'User ID');
  
    const conventionCollection = await conventions();
    const updateResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      {
        $addToSet: { attendees: new ObjectId(userId) },
        $pull: { attendeeApplications: new ObjectId(userId) }
      }
    );
  
    if (updateResult.matchedCount === 0) throw 'Convention not found';
    if (updateResult.modifiedCount === 0) throw 'Attendee already exists';
    return await getConventionById(conventionId);
  };

  //Reject attendee
  export const rejectAttendeeApplication = async (conventionId: string, userId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
    userId = checkId(userId, 'User ID');
  
    const conventionCollection = await conventions();
    const updateResult = await conventionCollection.updateOne(
      { _id: new ObjectId(conventionId) },
      { $pull: { attendeeApplications: new ObjectId(userId) } }
    );
  
    if (updateResult.matchedCount === 0) throw 'Convention not found';
    if (updateResult.modifiedCount === 0) throw 'No such attendee application';
  
    return await getConventionById(conventionId);
  };
  export const listAttendees = async (conventionId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
  
    const conventionCollection = await conventions();
    const convention = await conventionCollection.findOne(
      { _id: new ObjectId(conventionId) },
      { projection: { attendees: 1 } }
    );
  
    if (!convention) throw 'Convention not found';
  
    const userCollection = await users();
    const attendeeUsers = await userCollection
      .find({ _id: { $in: convention.attendees || [] } })
      .project({ username: 1 })  
      .toArray();
  
    return attendeeUsers;
  };
    export const listAttendeeApplications = async (conventionId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
  
    const conventionCollection = await conventions();
    const convention = await conventionCollection.findOne({ _id: new ObjectId(conventionId) });
    if (!convention) throw 'Convention not found';
  
    return convention.attendeeApplications || [];
  };
  export const getUserBookmarkedConventions = async (userId: string) => {
    userId = checkId(userId, 'User ID');
    const userCollection = await users();
    const conventionCollection = await conventions();
  
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'User not found';
  
    if (!user.bookmarks || user.bookmarks.length === 0) return [];
  
    const result = await conventionCollection.find({
      _id: { $in: user.bookmarks }
    }).toArray();
  
    return result.map((c) => ({
      _id: c._id.toString(),
      name: c.name || '',
      tags: c.tags ?? [],
      startDate: c.startDate || '',
      endDate: c.endDate || '',
      description: c.description || '',
      isOnline: c.isOnline ?? false,
      address: c.address || '',
      exclusive: c.exclusive ?? false,
      owners: (c.owners || []).map((o) => o.toString?.() ?? o),
      panelists: (c.panelists || []).map((p) => p.toString?.() ?? p),
      attendees: (c.attendees || []).map((a) => a.toString?.() ?? a),
      panelistApplications: (c.panelistApplications || []).map((p) => p.toString?.() ?? p),
      attendeeApplications: (c.attendeeApplications || []).map((a) => a.toString?.() ?? a),
      imageUrl: c.imageUrl || '/default-convention-banner.png',
      productCount: c.productCount ?? 0,
      groupCount: c.groupCount ?? 0,
      countdownDays: calculateCountdownDays(c.startDate)
    }));
  };
  
  export const getRecommendedConventions = async (userId: string, page: number, pageSize: number) => {
    userId = checkId(userId, 'User ID');
    const conventionCollection = await conventions();
  
    const total = await conventionCollection.countDocuments();
  
    const result = await conventionCollection.aggregate([
      {
        $project: {
          name: 1,
          tags: 1,
          startDate: 1,
          endDate: 1,
          description: 1,
          address: 1,
          isOnline: 1,
          exclusive: 1,
          owners: 1,
          panelists: 1,
          attendees: 1,
          panelistApplications: 1,
          attendeeApplications: 1,
          imageUrl: 1,
          productCount: 1,
          groupCount: 1,
          attendeesCount: { $size: "$attendees" }
        }
      },
      { $sort: { attendeesCount: -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize }
    ]).toArray();
  
    const totalPages = Math.ceil(total / pageSize);
  
    return {
      conventions: result.map((c) => ({
        _id: c._id.toString(),
        name: c.name || '',
        tags: c.tags ?? [],
        startDate: c.startDate || '',
        endDate: c.endDate || '',
        description: c.description || '',
        isOnline: c.isOnline ?? false,
        address: c.address || '',
        exclusive: c.exclusive ?? false,
        owners: (c.owners || []).map((o) => o.toString?.() ?? o),
        panelists: (c.panelists || []).map((p) => p.toString?.() ?? p),
        attendees: (c.attendees || []).map((a) => a.toString?.() ?? a),
        panelistApplications: (c.panelistApplications || []).map((p) => p.toString?.() ?? p),
        attendeeApplications: (c.attendeeApplications || []).map((a) => a.toString?.() ?? a),
        imageUrl: c.imageUrl || '/default-convention-banner.png',
        productCount: c.productCount ?? 0,
        groupCount: c.groupCount ?? 0,
        countdownDays: calculateCountdownDays(c.startDate)
      })),
      total,
      page,
      pageSize,
      totalPages
    };
  };
  
  
export default {
  createConvention,
  getConventionById,
  getAllConventions,
  updateConvention,
  deleteConvention,
  addOwner,
  removeOwner,
  addPanelist,
  removePanelist,
  applyPanelist,
  approvePanelistApplication,
  rejectPanelistApplication,
  applyAttendee,
  getAllAttendeeApplication,
  removeAttendee,
  approveAttendeeApplication,
  rejectAttendeeApplication,
  listAttendees,
  listAttendeeApplications,
  getUserBookmarkedConventions,
  getRecommendedConventions
};
