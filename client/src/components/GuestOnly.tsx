import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import userContext from '../context/userContext';

const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useContext(userContext);
  
    if (user) {
      // if user is logged in, redirect to home page
      return <Navigate to="/" replace />;
    }
  
    return <>{children}</>;
  };
  
  export default GuestOnly;