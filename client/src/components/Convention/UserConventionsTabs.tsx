import React from 'react';
import '../ui/Tab.css'
interface UserConventionsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = ['Attending', 'Created', 'Following', 'Picked for you'];

const UserConventionsTabs: React.FC<UserConventionsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div >
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`tab-button ${activeTab === tab ? 'active-tab' : ''}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default UserConventionsTabs;
