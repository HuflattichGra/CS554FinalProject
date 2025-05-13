import React from 'react';

export interface User {
  _id: string;
  admin: boolean;
  username: string;
  firstname: string;
  lastname: string;
  following: string[];
  followers: string[];
}

interface userContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// default to null and empty function
const defaultValue: userContextType = {
  user: null,

  setUser: () => {}, 

};

const userContext = React.createContext<userContextType>(defaultValue);

export default userContext;