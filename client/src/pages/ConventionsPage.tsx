import React, { useContext, useState, useEffect, } from 'react';
import {
  getAllConventions,
  getUserFollowingConventions,
  getRecommendedConventions,
} from '../api/conventions';
import ConventionCard from '../components/Convention/ConventionCard';
import CreateConventionModal from '../components/Convention/CreateConventionModal';
import Pagination from '../components/Convention/Pagination';
import UserConventionsTabs from '../components/Convention/UserConventionsTabs';
import userContext from '../context/userContext';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/ui/conventionPage.css'
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';

const TABS = ['Created', 'Attending', 'Following', 'Picked for you', 'Search'];

const ConventionsPage: React.FC = () => {
  const { user } = useContext(userContext);
  const location = useLocation();

  const [tab, setTab] = useState(() => {
    const savedTab = sessionStorage.getItem('conventionTab');
    return TABS.includes(savedTab || '') ? savedTab! : 'Attending';
  });

  const [showModal, setShowModal] = useState(false);
  const [conventions, setConventions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [allConventions, setAllConventions] = useState<any[]>([]);

  // Effect to handle search text changes
  useEffect(() => {
    setLoading(true);
    console.log(allConventions.length);
    if (!user) { setTab('Search'); }
    if (tab === 'Search' && allConventions.length > 0) {
      const pageSize = 10;

      // Filter the already fetched conventions based on search text
      const filtered = searchText.trim()
        ? allConventions.filter((c: any) =>
          c.name.toLowerCase().includes(searchText.toLowerCase())
        )
        : allConventions;

      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;

      setConventions(filtered.slice(startIdx, endIdx));
      setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
    }
    setLoading(false);
  }, [searchText, page, tab, allConventions, user]);

  const fetchConventions = async () => {
    const pageSize = 10;

    try {
      let conventions: any[] = [];
      let totalPages = 1;

      if (tab === 'Created') {
        if (!user) return;
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
        if (!user) return;
        const res = await getAllConventions(1, 9999);
        const filtered = res.conventions.filter((c: any) =>
          c.attendees.includes(user._id)
        );
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;

        conventions = filtered.slice(startIdx, endIdx);
        totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      }

      else if (tab === 'Picked for you') {
        if (!user) return;
        const res = await getRecommendedConventions(user._id, 1, 9999);
        const now = new Date();

        const filtered = (res.conventions || []).filter((c: any) =>
          new Date(c.endDate) >= now && !c.owners.includes(user._id)
        );

        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;

        conventions = filtered.slice(startIdx, endIdx);
        totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      }

      else if (tab === 'Search') {
        const res = await getAllConventions(1, 9999);
        setAllConventions(res.conventions || []);

        // If search text already exists, filter immediately
        if (searchText.trim()) {
          const filtered = res.conventions.filter((c: any) =>
            c.name.toLowerCase().includes(searchText.toLowerCase())
          );

          const startIdx = (page - 1) * pageSize;
          const endIdx = startIdx + pageSize;

          conventions = filtered.slice(startIdx, endIdx);
          totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        } else {
          // No search text, show all conventions with pagination
          const startIdx = (page - 1) * pageSize;
          const endIdx = startIdx + pageSize;

          conventions = res.conventions.slice(startIdx, endIdx);
          totalPages = Math.max(1, Math.ceil(res.conventions.length / pageSize));
        }
      }

      else if (tab === 'Following') {
        if (!user) return;
        const res = await getUserFollowingConventions(user._id, page, pageSize);
        conventions = res.conventions || [];
        totalPages = res.totalPages || 1;
      }

      setConventions(conventions);
      setTotalPages(totalPages);

    } catch (e) {
      console.error('Failed to fetch conventions', e);
    }
  };
  conventions.map((con: any) => {
    const isPast = new Date(con.endDate) < new Date();
    const isAdmin = user?.admin;
    const isClickable = isAdmin || !isPast;

    return (
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
        isClickable={isClickable}
        currentTab={tab}
        isOnline={con.isOnline}
      />
    );
  });

  useEffect(() => {
    fetchConventions();
    const fromTab = location.state?.fromTab;
    if (fromTab && TABS.includes(fromTab)) {
      setTab(fromTab);
      window.history.replaceState({}, document.title, location.pathname);
    }
    window.scrollTo(0, 0);
  }, [user, tab, page, location]);

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading user session...</div>;
  }

  return (
    <div className="conventions-page">
      <div className="conventions-header">
        <h1 className="conventions-title">My Conventions</h1>
        {user ?
          <Button
            onClick={() => setShowModal(true)}
          >
            + Create Convention
          </Button> : <></>
        }
      </div>

      <UserConventionsTabs
        activeTab={tab}
        onTabChange={(t) => {
          setTab(t);
          setPage(1);
          sessionStorage.setItem('conventionTab', t);
          // Reset search text when changing tabs
          if (t !== 'Search') {
            setSearchText('');
          }
        }}
      />

      {tab === 'Search' && (
        <div className="search-container" style={{ margin: '16px 0', width: '100%', maxWidth: '400px' }}>
          <Input
            type="text"
            placeholder="Search conventions by name..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            style={{ width: '100%' }}
          />
        </div>
      )}

      <div className="conventions-grid">
        {conventions.length === 0 ? (
          <p className="conventions-empty">No conventions found.</p>
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
              owners={con.owners}
              currentTab={tab}
              isOnline={con.isOnline}
            />
          ))
        )}
      </div>

      {['Created', 'Attending', 'Picked for you', 'Following', 'Search'].includes(tab) && (
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
