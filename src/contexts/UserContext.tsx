import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getToken, saveToken, removeToken } from '../utils/Setcookie';
import { setAuthToken } from '../services/api';

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
  token: string | null;
  setToken: (token: string | null) => Promise<void>;
  clearToken: () => Promise<void>;
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

  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    // load token from storage on mount
    (async () => {
      try {
        const t = await getToken();
        if (t) {
          setTokenState(t);
          setAuthToken(t);
        }
      } catch (e) {
        console.warn('Failed to load token in UserProvider', e);
      }
    })();
  }, []);

  const setToken = async (t: string | null) => {
    try {
      if (t) {
        await saveToken(t);
        setTokenState(t);
        setAuthToken(t);
      } else {
        await removeToken();
        setTokenState(null);
        setAuthToken(null);
      }
    } catch (e) {
      console.warn('setToken error:', e);
    }
  };

  const clearToken = async () => {
    await setToken(null);
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, token, setToken, clearToken }}>
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
