import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getConventionById } from '../api/conventions';
import userContext from '../context/userContext';
import ManageConventionPanel from '../components/Convention/ManageConventionPanel';

const ConventionDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useContext(userContext);
  const [convention, setConvention] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchConvention = useCallback(async () => {
    try {
      if (!id) return;
      const data = await getConventionById(id);
      setConvention(data);
    } catch (e) {
      console.error('Failed to load convention', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConvention();
  }, [fetchConvention]);

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading convention...</div>;
  }

  if (!convention) {
    return <div className="text-center mt-10 text-red-500">Convention not found.</div>;
  }

  const isOwner = user && Array.isArray(convention.owners) && convention.owners.includes(user._id);
  const isAdmin = user?.admin;

  const isAttending = user && Array.isArray(convention.attendees) && convention.attendees.includes(user._id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <img
        src={convention.imageUrl || '/default-convention-banner.png'}
        alt="Banner"
        className="w-full h-64 object-cover rounded mb-4"
      />

      <h1 className="text-3xl font-bold mb-2">{convention.name}</h1>
      <p className="text-sm text-gray-500 mb-2">
        {convention.startDate} - {convention.endDate}
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
      </div>

      {(isOwner || isAdmin) ? (
        <ManageConventionPanel convention={convention} refresh={fetchConvention} />
      ) : (
        <div className="mt-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            {isAttending ? 'You are attending' : 'Apply to Attend'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConventionDetailPage;
