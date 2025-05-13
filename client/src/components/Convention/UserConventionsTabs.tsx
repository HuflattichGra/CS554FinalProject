import React from 'react';
import userContext from '../../context/userContext';
import { useContext } from 'react';


import '../ui/Tab.css'
interface UserConventionsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = ['Attending', 'Created', 'Following', 'Picked for you'];

const UserConventionsTabs: React.FC<UserConventionsTabsProps> = ({ activeTab, onTabChange }) => {
  const { user } = useContext(userContext);
  return (
    <div >
      {user ?  TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`tab-button ${activeTab === tab ? 'active-tab' : ''}`}
        >
          {tab}
        </button>
      )) : <></>}
       <button
          key={'Search'}
          onClick={() => onTabChange('Search')}
          className={`tab-button ${activeTab === 'Search' ? 'active-tab' : ''}`}
        >
          {'Search'}
        </button>
    </div>
  );
};

export default UserConventionsTabs;
