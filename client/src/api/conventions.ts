import axios from "axios";
import { API_BASE } from ".";

const API_URL = `${API_BASE}/conventions`;

// create Convention
export const createConvention = async (conventionData: any) => {
  const { data } = await axios.post(API_URL, conventionData, {
    withCredentials: true,
  });
  return data;
};

// get Convention By Id
export const getConventionById = async (id: string) => {
  const { data } = await axios.get(`${API_URL}/${id}`, {
    withCredentials: true,
  });
  return data;
};

// get All Conventions
export const getAllConventions = async (page = 1, pageSize = 10) => {
  const { data } = await axios.get(
    `${API_URL}?page=${page}&pageSize=${pageSize}`,
    {
      withCredentials: true,
    }
  );
  return data;
};

// get Every Convention (simplified list with just id and name)
export const getEveryConvention = async () => {
  const { data } = await axios.get(`${API_URL}/every`, {
    withCredentials: true,
  });
  return data;
};

// update Convention
export const updateConvention = async (id: string, updateData: any) => {
  const { data } = await axios.put(`${API_URL}/${id}`, updateData, {
    withCredentials: true,
  });
  return data;
};

// delete Convention
export const deleteConvention = async (id: string) => {
  const { data } = await axios.delete(`${API_URL}/${id}`, {
    withCredentials: true,
  });
  return data;
};

// add Owner
export const addOwner = async (conventionId: string, ownerId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/addOwner`,
    {
      ownerId,
    },
    {
      withCredentials: true,
    }
  );
  return data;
};

// remove Owner
export const removeOwner = async (conventionId: string, ownerId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/removeOwner`,
    {
      ownerId,
    },
    {
      withCredentials: true,
    }
  );
  return data;
};

// add Panelist by auth
export const addPanelist = async (conventionId: string, panelistId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/addPanelist`,
    {
      panelistId,
    },
    {
      withCredentials: true,
    }
  );
  return data;
};

// remove Panelist
export const removePanelist = async (
  conventionId: string,
  panelistId: string
) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/removePanelist`,
    {
      panelistId,
    },
    {
      withCredentials: true,
    }
  );
  return data;
};

// apply Panelist
export const applyPanelist = async (conventionId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/applyPanelist`,
    {},
    { withCredentials: true }
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
    { applicantId },
    { withCredentials: true }
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
    { applicantId },
    { withCredentials: true }
  );
  return data;
};

// apply Attendee
export const applyAttendee = async (conventionId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/applyAttendee`,
    {},
    { withCredentials: true }
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
    { attendeeId },
    { withCredentials: true }
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
    { applicantId },
    { withCredentials: true }
  );
  return data;
};

export const addAttendee = async (conventionId: string, attendeeId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/addAttendee`,
    { attendeeId },
    { withCredentials: true }
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
    { applicantId },
    { withCredentials: true }
  );
  return data;
};

export const cancelAttendeeApplication = async (conventionId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/cancelAttendeeApplication`,
    {},
    { withCredentials: true }
  );
  return data;
};

// Query all attendees
export const listAttendees = async (conventionId: string) => {
  const { data } = await axios.get(`${API_URL}/${conventionId}/attendees`, {
    withCredentials: true,
  });
  return data;
};

// Query all attendee applications
export const listAttendeeApplications = async (conventionId: string) => {
  const { data } = await axios.get(
    `${API_URL}/${conventionId}/attendeeApplications`,
    { withCredentials: true }
  );
  return data;
};

// get bookmarked conventions
export const getUserBookmarkedConventions = async (userId: string) => {
  const { data } = await axios.get(`${API_URL}/user/${userId}/bookmarked`, {
    withCredentials: true,
  });
  return data;
};

// get rec conventions
export const getRecommendedConventions = async (
  userId: string,
  page = 1,
  pageSize = 8
) => {
  const { data } = await axios.get(
    `${API_URL}/user/${userId}/recommended?page=${page}&pageSize=${pageSize}`,
    {
      withCredentials: true,
    }
  );
  return data;
};

export const listPanelistApplications = async (conventionId: string) => {
  const { data } = await axios.get(
    `/conventions/${conventionId}/panelistApplications`,
    { withCredentials: true }
  );
  return data;
};
export const followConvention = async (conventionId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/follow`,
    {},
    { withCredentials: true }
  );
  return data;
};

export const unfollowConvention = async (conventionId: string) => {
  const { data } = await axios.patch(
    `${API_URL}/${conventionId}/unfollow`,
    {},
    { withCredentials: true }
  );
  return data;
};

export const getUserFollowingConventions = async (
  userId: string,
  page: number,
  pageSize: number
) => {
  const { data } = await axios.get(
    `${API_URL}/user/${userId}/following?page=${page}&pageSize=${pageSize}`,
    {
      withCredentials: true,
    }
  );
  return data;
};
export const sponsorConvention = async (
  conventionId: string,      
  amount: number = 10           
) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/${conventionId}/sponsor`,
      { amount },            
      { withCredentials: true }
    );

    return data;
  } catch (err: any) {
    console.error(err);
    throw err?.response?.data?.error ?? 'Failed to sponsor';
  }
};
export default {
  createConvention,
  getConventionById,
  getAllConventions,
  getEveryConvention,
  updateConvention,
  deleteConvention,
  addOwner,
  removeOwner,
  addPanelist,
  removePanelist,
  applyPanelist,
  approvePanelistApplication,
  rejectPanelistApplication,
  cancelAttendeeApplication,
  applyAttendee,
  removeAttendee,
  approveAttendeeApplication,
  rejectAttendeeApplication,
  listAttendees,
  listAttendeeApplications,
  getUserBookmarkedConventions,
  getRecommendedConventions,
  listPanelistApplications,
  followConvention,
  unfollowConvention,
  getUserFollowingConventions,
  sponsorConvention
};
