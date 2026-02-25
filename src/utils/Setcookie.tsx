import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';

export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('saveToken error:', e);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    return t;
  } catch (e) {
    console.error('getToken error:', e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('removeToken error:', e);
  }
};

export default {
  saveToken,
  getToken,
  removeToken,
};