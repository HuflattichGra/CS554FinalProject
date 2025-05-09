import axios from "axios";
import { API_BASE } from ".";

const API_URL = `${API_BASE}/conventions`;

// create Convention
export const createConvention = async (conventionData: any) => {
  const { data } = await axios.post(API_URL, conventionData);
  return data;
};

// get Convention By Id
export const getConventionById = async (id: string) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

// get All Conventions
export const getAllConventions = async (page = 1, pageSize = 10) => {
  const { data } = await axios.get(
    `${API_URL}?page=${page}&pageSize=${pageSize}`
  );
  return data;
};

// update Convention
export const updateConvention = async (id: string, updateData: any) => {
  const { data } = await axios.put(`${API_URL}/${id}`, updateData);
  return data;
};

// delete Convention
export const deleteConvention = async (id: string) => {
  const { data } = await axios.delete(`${API_URL}/${id}`);
  return data;
};

// add Owner
export const addOwner = async (conventionId: string, ownerId: string) => {
  const { data } = await axios.patch(`${API_URL}/${conventionId}/addOwner`, {
    ownerId,
  });
  return data;
};

// remove Owner
export const removeOwner = async (conventionId: string, ownerId: string) => {
  const { data } = await axios.patch(`${API_URL}/${conventionId}/removeOwner`, {
    ownerId,
  });
  return data;
};

// add Panelist by auth
export const addPanelist = async (conventionId: string, panelistId: string) => {
  const { data } = await axios.patch(`${API_URL}/${conventionId}/addPanelist`, {
    panelistId,
  });
  return data;
};

// remove Panelist
export const removePanelist = async (
  conventionId: string,
  panelistId: string
) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/removePanelist`,
    { panelistId }
  );
  return data;
};

// apply Panelist
export const applyPanelist = async (conventionId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/applyPanelist`
  );
  return data;
};

// approve Panelist Application
export const approvePanelistApplication = async (
  conventionId: string,
  applicantId: string
) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/approvePanelist`,
    { applicantId }
  );
  return data;
};

// reject Panelist Application
export const rejectPanelistApplication = async (
  conventionId: string,
  applicantId: string
) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/rejectPanelist`,
    { applicantId }
  );
  return data;
};

// apply Attendee
export const applyAttendee = async (conventionId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/applyAttendee`
  );
  return data;
};

// remove Attendee
export const removeAttendee = async (
  conventionId: string,
  attendeeId: string
) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/removeAttendee`,
    { attendeeId }
  );
  return data;
};

// approve Attendee Application
export const approveAttendeeApplication = async (
  conventionId: string,
  applicantId: string
) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/approveAttendee`,
    { applicantId }
  );
  return data;
};

// reject Attendee Application
export const rejectAttendeeApplication = async (
  conventionId: string,
  applicantId: string
) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/rejectAttendee`,
    { applicantId }
  );
  return data;
};

// Query all attendees
export const listAttendees = async (conventionId: string) => {
  const { data } = await axios.get(`${API_URL}/${conventionId}/attendees`);
  return data;
};

// Query all attendee applications
export const listAttendeeApplications = async (conventionId: string) => {
  const { data } = await axios.get(
    `${API_URL}/${conventionId}/attendeeApplications`
  );
  return data;
};
// get bookmarked conventions
export const getUserBookmarkedConventions = async (userId: string) => {
  const { data } = await axios.get(`${API_URL}/user/${userId}/bookmarked`);
  return data;
};

// get rec conventions
export const getRecommendedConventions = async (userId: string) => {
  const { data } = await axios.get(`${API_URL}/user/${userId}/recommended`);
  return data;
};
export const listPanelistApplications = async (conventionId: string) => {
  const { data } = await axios.get(
    `/conventions/${conventionId}/panelistApplications`
  );
  return data;
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
  listAttendeeApplications,
  getUserBookmarkedConventions,
  getRecommendedConventions,
  listPanelistApplications,
};
