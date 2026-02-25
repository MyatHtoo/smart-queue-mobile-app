import React, { createContext, useState, useContext, ReactNode } from 'react';

type UserData = {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  token?: string;
  id?: string;
};

type UserContextType = {
  userData: UserData;
  setUserData: (data: UserData) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    token: '',
    id: '',
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
