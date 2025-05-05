import { conventions } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { checkStringTrimmed, checkId, checkDate } from '../typechecker.js';

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
  const convention = await conventionCollection.findOne({ _id: new ObjectId(id) });

  if (!convention) throw 'Convention not found';

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
    panelists: convention.panelists,
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
    conventions: conventionList,
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
  
    if (convention.exclusive) {
      // exclusive attendees
      const updateResult = await conventionCollection.updateOne(
        { _id: new ObjectId(conventionId) },
        { $addToSet: { attendeeApplications: new ObjectId(userId) } }
      );
      if (updateResult.modifiedCount === 0) throw 'Already applied';
    } else {
      // not exclusive attendees
      const updateResult = await conventionCollection.updateOne(
        { _id: new ObjectId(conventionId) },
        { $addToSet: { attendees: new ObjectId(userId) } }
      );
      if (updateResult.modifiedCount === 0) throw 'Already joined';
    }
  
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
    if (updateResult.modifiedCount === 0) throw 'Approval failed';
  
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
    const convention = await conventionCollection.findOne({ _id: new ObjectId(conventionId) });
    if (!convention) throw 'Convention not found';
  
    return convention.attendees || [];
  };
  export const listAttendeeApplications = async (conventionId: string) => {
    conventionId = checkId(conventionId, 'Convention ID');
  
    const conventionCollection = await conventions();
    const convention = await conventionCollection.findOne({ _id: new ObjectId(conventionId) });
    if (!convention) throw 'Convention not found';
  
    return convention.attendeeApplications || [];
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
  removeAttendee,
  approveAttendeeApplication,
  rejectAttendeeApplication,
  listAttendees,
  listAttendeeApplications
};
