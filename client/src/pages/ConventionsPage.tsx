import React, { useContext, useState, useEffect } from 'react';
import {
  getAllConventions,
  getUserBookmarkedConventions,
  getRecommendedConventions
} from '../api/conventions';
import ConventionCard from '../components/Convention/ConventionCard';
import CreateConventionModal from '../components/Convention/CreateConventionModal';
import Pagination from '../components/Convention/Pagination';
import UserConventionsTabs from '../components/Convention/UserConventionsTabs';
import userContext from '../context/userContext';
import { useLocation } from 'react-router-dom';

const TABS = ['Created', 'Attending', 'Bookmarked', 'Recommended'];

const ConventionsPage: React.FC = () => {
  const { user } = useContext(userContext);
  const [tab, setTab] = useState('Attending');
  const [showModal, setShowModal] = useState(false);
  const [conventions, setConventions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();

  const fetchConventions = async () => {
    if (!user) return;
    const pageSize = 10;

    try {
      let conventions: any[] = [];
      let totalPages = 1;

      if (tab === 'Created') {
        const res = await getAllConventions(1, 9999);
        const filtered = res.conventions.filter((c: any) =>
          c.owners.includes(user._id)
        );
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;

        conventions = filtered.slice(startIdx, endIdx);
        totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      }

      else if (tab === 'Attending') {
        const res = await getAllConventions(1, 9999);
        const filtered = res.conventions.filter((c: any) =>
          c.attendees.includes(user._id)
        );
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;

        conventions = filtered.slice(startIdx, endIdx);
        totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      }

      else if (tab === 'Recommended') {
        const res = await getRecommendedConventions(user._id, page, pageSize);
        conventions = res.conventions || [];
        totalPages = res.totalPages || 1;
      }

      else if (tab === 'Bookmarked') {
        const all = await getUserBookmarkedConventions(user._id);
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        conventions = all.slice(startIdx, endIdx);
        totalPages = Math.max(1, Math.ceil(all.length / pageSize));
      }

      setConventions(conventions);
      setTotalPages(totalPages);

    } catch (e) {
      console.error('Failed to fetch conventions', e);
    }
  };


  useEffect(() => {
    if (user) {
      fetchConventions();
      
    }
  }, [user, tab, page,location.state]);

  if (!user) {
    return <div className="text-center mt-10 text-gray-500">Loading user session...</div>;
  }

  return (
    <div className="conventions-page max-w-5xl mx-auto px-4">
      <div className="flex justify-between items-center mt-6 mb-4">
        <h1 className="text-2xl font-bold">My Conventions</h1>
        <button
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          onClick={() => setShowModal(true)}
        >
          + Create Convention
        </button>
      </div>

      <UserConventionsTabs activeTab={tab} onTabChange={(t) => {
        setTab(t);
        setPage(1);
      }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {conventions.length === 0 ? (
          <p className="text-gray-400 col-span-2">No conventions found.</p>
        ) : (
          conventions.map((con: any) => (
            <ConventionCard
              key={con._id}
              _id={con._id}
              name={con.name}
              tags={con.tags}
              startDate={con.startDate}
              endDate={con.endDate}
              address={con.address}
              imageUrl={con.imageUrl}
              countdownDays={con.countdownDays}
              productCount={con.productCount}
              groupCount={con.groupCount}
              onDeleted={fetchConventions}
            />

          ))
        )}
      </div>

      {['Created', 'Attending', 'Recommended', 'Bookmarked'].includes(tab) && (
        <Pagination current={page} total={totalPages} onPageChange={setPage} />
      )}



      {showModal && (
        <CreateConventionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchConventions}
        />
      )}

    </div>
  );
};

export default ConventionsPage;
