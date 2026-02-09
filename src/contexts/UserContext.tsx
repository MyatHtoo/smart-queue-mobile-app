import React, { createContext, useState, useContext, ReactNode } from 'react';

type UserData = {
  username: string;
  email: string;
  password: string;
};

type UserContextType = {
  userData: UserData;
  setUserData: (data: UserData) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({
    username: '',
    email: '',
    password: '',
  });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
