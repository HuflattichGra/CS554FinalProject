import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getConventionById, applyAttendee,
  removeAttendee, cancelAttendeeApplication, sponsorConvention
} from '../api/conventions';
import userContext from '../context/userContext';
import ManageConventionPanel from '../components/Convention/ManageConventionPanel';
import { Badge } from '../components/ui/badge.tsx';
import { Link } from 'react-router-dom';
import '../components/ui/conventionDetail.css'
import axios from "axios";
const ConventionDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user, setUser } = useContext(userContext);

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
  const handleSponsor = async () => {
    if (!user?._id) {
      alert('Please log in to sponsor.');
      return;
    }

    try {
      const { balance, fundings } = await sponsorConvention(convention._id);
      alert('Thank you for supporting this convention!');
      setConvention((prev) => ({ ...prev, fundings }));
      setUser?.((prev) => ({ ...prev, balance }));
    } catch (e: any) {
      alert(e);
    }
  }; const handleApply = async () => {

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
    fundings: c.fundings ?? 0
  });

  useEffect(() => {
    fetchConvention();
  }, [fetchConvention]);


  if (!convention) {
    return <div>Convention not found.</div>;
  }

  const isOwner = user && Array.isArray(convention.owners) && convention.owners.includes(user._id);
  const isAdmin = user?.admin;
  const isEnded = new Date(convention.endDate) < new Date();


  const hasUser = (list: any[] | undefined, userId: string): boolean => {
    if (!userId) return false;
    return Array.isArray(list) && list.some((id: any) => id?.toString?.() === userId);
  };

  const isAttending = user && hasUser(convention.attendees, user._id);


  return (
    <div className="convention-detail-container">
      <img
        src={convention.imageUrl || '/default-convention-banner.png'}
        alt="Banner"
        className="convention-banner"
      />

      <h1 className="convention-title">{convention.name}</h1>

      <p className="convention-dates">
        {new Date(convention.startDate).toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })} -{' '}
        {new Date(convention.endDate).toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>


      <p className="convention-location">
        {convention.isOnline ? 'Online' : convention.address}
      </p>

      <p className="convention-description">{convention.description}</p>

      {Array.isArray(convention.tags) && convention.tags.length > 0 && (
        <div className="convention-tags">
          <span className="tags-label">Tags:</span>{' '}
          {convention.tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="tag-badge"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="exclusive-panelist-section">
        {/* <strong>Countdown:</strong> {convention.countdownDays} days |{' '} */}
        <strong>Exclusive:</strong> {convention.exclusive ? 'Yes' : 'No'}
        {/* {convention.panelists.length > 0 && (
        )} */}


        {Array.isArray(convention.panelists) && convention.panelists.length >= 0 && !(isOwner || isAdmin) && (
          <div className="panelist-list-container">
            <div className="panelist-label"> <span>Panelists:
              {convention.panelists.length < 1 ? ' Stay Tune!' : ''}</span></div>
            <div className="panelist-list">
              {convention?.panelists?.map((p: any) => {
                const userId = typeof p._id === 'object' && p._id?.$oid
                  ? p._id.$oid
                  : p._id?.toString?.() || '';

                return (
                  <Link to={`/user/${userId}`} key={userId}>
                    <Badge >
                      {p.username}
                    </Badge>
                  </Link>
                );
              })}
            </div>

          </div>
        )}
      </div>



      {(isOwner || isAdmin) ? (
        <>
          <p className="fundings-display">
            <strong>Total Fundings:</strong> ${convention.fundings}
          </p>

          <ManageConventionPanel convention={convention} refresh={fetchConvention} />
        </>
      ) : (
        <div className="attendance-action">
          {!isEnded && (
            <button className="btn-sponsor" onClick={handleSponsor}>
              Sponsor $10
            </button>
          )}
          {isAttending ? (

            <button
              className="btn-cancel"
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
                <div className="application-status">
                  <span className="application-status-label">Applied for attendance</span>
                  <button
                    className="btn-red"
                    onClick={handleCancelApplication}
                  >
                    Cancel Application
                  </button>

                </div>
              ) : (
                <div>
                  {!isEnded && <button
                    className="btn-apply"
                    onClick={handleApply}
                  >
                    {user ? "Apply to Attend" : "Login To Attend!"}
                  </button>}
                </div>
              )}

            </div>

          )}
        </div>
      )}

    </div>
  );
};

export default ConventionDetailPage;