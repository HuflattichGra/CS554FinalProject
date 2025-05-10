import React from 'react';

interface UserConventionsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = ['Attending', 'Created', 'Bookmarked', 'Recommended'];

const UserConventionsTabs: React.FC<UserConventionsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-4 border-b border-gray-300 mb-4">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 font-medium ${
            activeTab === tab
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default UserConventionsTabs;
