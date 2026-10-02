import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type StoredSession = { token: string; expiresAt: number };

const getJwtExpiry = (token: string): number | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const saveToken = async (token: string) => {
  try {
    const jwtExpiry = getJwtExpiry(token);
    const expiresAt = Math.min(Date.now() + SESSION_MAX_AGE_MS, jwtExpiry ?? Infinity);
    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify({ token, expiresAt } satisfies StoredSession));
  } catch (e) {
    console.error('saveToken error:', e);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    if (!t) return null;
    let session: StoredSession;
    try {
      const parsed = JSON.parse(t);
      // Also support values stored as a JSON string by older builds.
      session = typeof parsed === 'string'
        ? { token: parsed, expiresAt: Date.now() + SESSION_MAX_AGE_MS }
        : parsed;
    } catch {
      // Migrate tokens saved by older app versions, but still enforce one week.
      session = { token: t, expiresAt: Date.now() + SESSION_MAX_AGE_MS };
    }
    if (!session?.token || !session?.expiresAt || Date.now() >= session.expiresAt) {
      await removeToken();
      return null;
    }
    console.log('[AUTH] Restored saved session');
    return session.token;
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
