import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, saveToken, removeToken } from '../utils/Setcookie';
import { setAuthToken, setUnauthorizedHandler } from '../services/api';

type UserData = {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  profileImage?: string;
  token?: string;
  id?: string;
};

type UserContextType = {
  userData: UserData;
  setUserData: (data: UserData) => void;
  token: string | null;
  setToken: (token: string | null) => Promise<void>;
  clearToken: () => Promise<void>;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);
const USER_DATA_KEY = '@user_profile';
const userDataKey = (id: string) => `${USER_DATA_KEY}:${id}`;

const userIdFromToken = (token?: string | null): string => {
  if (!token) return '';
  try {
    const payload = token.split('.')[1];
    if (!payload) return '';
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return String(decoded?.sub ?? decoded?.userId ?? decoded?.userID ?? decoded?.id ?? decoded?._id ?? '');
  } catch {
    return '';
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserDataState] = useState<UserData>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    profileImage: '',
    token: '',
    id: '',
  });

  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      // Clear local credentials when the backend rejects an expired/revoked token.
      void removeToken();
      setTokenState(null);
      setAuthToken(null);
    });

    // load token from storage on mount
    (async () => {
      try {
        const t = await getToken();
        const accountId = userIdFromToken(t);
        const accountKey = accountId ? userDataKey(accountId) : USER_DATA_KEY;
        const savedProfile = await AsyncStorage.getItem(accountKey) ?? (
          accountId ? await AsyncStorage.getItem(USER_DATA_KEY) : null
        );
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setUserDataState((current) => ({ ...current, ...parsed, password: '' }));
          if (accountId) {
            await AsyncStorage.setItem(accountKey, JSON.stringify({ ...parsed, password: '' }));
          }
        }
        if (t) {
          setTokenState(t);
          setAuthToken(t);
        }
      } catch (e) {
        console.warn('Failed to load token in UserProvider', e);
      } finally {
        setIsLoading(false);
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, []);

  const setUserData = (data: UserData) => {
    const safeData = { ...data, password: '' };
    setUserDataState(safeData);
    const id = String(safeData.id || userIdFromToken(safeData.token));
    void AsyncStorage.setItem(id ? userDataKey(id) : USER_DATA_KEY, JSON.stringify(safeData));
  };

  const setToken = async (t: string | null) => {
    try {
      if (t) {
        await saveToken(t);
        setTokenState(t);
        setAuthToken(t);
      } else {
        await removeToken();
        const currentId = String(userData.id || '');
        if (currentId) await AsyncStorage.removeItem(userDataKey(currentId));
        await AsyncStorage.removeItem(USER_DATA_KEY);
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
    <UserContext.Provider value={{ userData, setUserData, token, setToken, clearToken, isLoading }}>
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
