import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getConventionById, applyAttendee, removeAttendee, cancelAttendeeApplication } from '../api/conventions';
import userContext from '../context/userContext';
import ManageConventionPanel from '../components/Convention/ManageConventionPanel';
import { Badge } from '../components/ui/badge';
const ConventionDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useContext(userContext);

  const [convention, setConvention] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchConvention = useCallback(async () => {
    try {
      if (!id) return;
      const data = await getConventionById(id);
      setConvention(flattenConvention(data));

    } catch (e) {
      console.error('Failed to load convention', e);
    } finally {
      setLoading(false);
    }
  }, [id]);
 
  const handleApply = async () => {
    if (!user || !user._id) {
      alert('Please log in to apply.');
      return;
    }

    try {
      const updated = await applyAttendee(convention._id);
      alert('Application submitted!');

      const flat = flattenConvention(updated);
      console.log('Updated convention data:', flat);
      setConvention(flat);
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || 'Failed to apply.');
    }
  };

  const handleCancelApplication = async () => {
    if (!user || !user._id) return;

    try {
      console.log('Cancelling application, exclusive:', convention.exclusive);
      let updated;

      updated = await cancelAttendeeApplication(convention._id);
      alert('Application withdrawn.');

      const flat = flattenConvention(updated);
      console.log('Updated convention data after cancellation:', flat);
      setConvention(flat);
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.error || 'Failed to cancel application.');
    }
  };

  const flattenConvention = (c: any) => ({
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
    panelists: c.panelists || [],  
    attendees: c.attendees || [],
    panelistApplications: c.panelistApplications || [],
    attendeeApplications: c.attendeeApplications || [],
    imageUrl: c.imageUrl || '/default-convention-banner.png',
    productCount: c.productCount ?? 0,
    groupCount: c.groupCount ?? 0,
  });
  

  useEffect(() => {
    fetchConvention();
  }, [fetchConvention]);
 

  if (!convention) {
    return <div className="text-center mt-10 text-red-500">Convention not found.</div>;
  }

  const isOwner = user && Array.isArray(convention.owners) && convention.owners.includes(user._id);
  const isAdmin = user?.admin;


  const hasUser = (list: any[] | undefined, userId: string): boolean => {
    if (!userId) return false;
    return Array.isArray(list) && list.some((id: any) => id?.toString?.() === userId);
  };

  const isAttending = user && hasUser(convention.attendees, user._id);


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <img
        src={convention.imageUrl || '/default-convention-banner.png'}
        alt="Banner"
        className="w-full h-64 object-cover rounded mb-4"
      />

      <h1 className="text-3xl font-bold mb-2">{convention.name}</h1>
      {/* <p className="text-sm text-gray-500 mb-2">
        {convention.startDate} - {convention.endDate}
      </p> */}
      <p>
        {new Date(convention.startDate).toISOString().slice(0, 10)} - {new Date(convention.endDate).toISOString().slice(0, 10)}
      </p>

      <p className="text-sm text-gray-600 mb-4">
        {convention.isOnline ? 'Online' : convention.address}
      </p>

      <p className="text-gray-700 mb-4">{convention.description}</p>

      {Array.isArray(convention.tags) && convention.tags.length > 0 && (
        <div className="mb-4">
          <span className="font-medium">Tags:</span>{' '}
          {convention.tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-block bg-gray-200 px-2 py-1 mr-2 rounded text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="text-sm text-gray-500 mb-6">
        {/* <strong>Countdown:</strong> {convention.countdownDays} days |{' '} */}
        <strong>Exclusive:</strong> {convention.exclusive ? 'Yes' : 'No'}
        {/* {convention.panelists.length > 0 && (
        )} */}
        <div className="mb-4"> <span className="font-medium">Panelists:
          {convention.panelists.length < 1 ? ' Stay Tune!' : ''}</span></div>

        {Array.isArray(convention.panelists) && convention.panelists.length > 0 && !(isOwner || isAdmin) && (
          <div className="mb-4">
            <span className="font-medium"></span>
            <div className="mt-2 flex gap-2 flex-wrap">
              {convention?.panelists?.map((p: any) => (
                <Badge
                key={
                  typeof p._id === 'object' && p._id?.$oid
                    ? p._id.$oid
                    : p._id?.toString?.() || p.username
                }
                className="flex items-center gap-2"
              >
                {p.username}
              </Badge>
              
              ))}
            </div>
          </div>
        )}
      </div>



      {(isOwner || isAdmin) ? (
        <ManageConventionPanel convention={convention} refresh={fetchConvention} />
      ) : (
        <div className="mt-6">
          {isAttending ? (
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded"
              onClick={async () => {
                const confirmLeave = window.confirm('Are you sure you want to cancel attending this convention?');
                if (!confirmLeave || !user) return;

                try {
                  console.log('Removing attendee:', user._id);
                  await removeAttendee(convention._id, user._id);
                  alert('You have canceled your attendance.');
                  fetchConvention();
                } catch (e: any) {
                  console.error(e);
                  alert(e?.response?.data?.error || 'Failed to remove attendee.');
                }
              }}
            >
              Cancel Attendance
            </button>
          ) : (
            <div>
              {hasUser(convention.attendeeApplications, user?._id || '') ? (
                <div className="flex items-center">
                  <span className="text-green-600 mr-3">Applied for attendance</span>
                  <button
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                    onClick={handleCancelApplication}
                  >
                    Cancel Application
                  </button>
                </div>
              ) : (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleApply}
                >
                  Apply to Attend
                </button>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ConventionDetailPage;