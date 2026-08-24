import AsyncStorage from '@react-native-async-storage/async-storage';

type AccountIdentity = {
  id?: string;
  email?: string;
  phoneNumber?: string;
};

const PROFILE_IMAGE_MAP_KEY = '@profile_image_map';

const normalize = (value?: string) => (value || '').trim();
const normalizeEmail = (value?: string) => normalize(value).toLowerCase();

const buildAccountKeys = (identity: AccountIdentity): string[] => {
  const keys: string[] = [];
  const id = normalize(identity.id);
  const email = normalizeEmail(identity.email);
  const phone = normalize(identity.phoneNumber);

  if (id) keys.push(`id:${id}`);
  if (email) keys.push(`email:${email}`);
  if (phone) keys.push(`phone:${phone}`);

  return keys;
};

const loadMap = async (): Promise<Record<string, string>> => {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_IMAGE_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, string>;
    }
    return {};
  } catch {
    return {};
  }
};

const saveMap = async (map: Record<string, string>) => {
  try {
    await AsyncStorage.setItem(PROFILE_IMAGE_MAP_KEY, JSON.stringify(map));
  } catch {}
};

export const getProfileImageForAccount = async (identity: AccountIdentity): Promise<string> => {
  const keys = buildAccountKeys(identity);
  if (!keys.length) return '';

  const map = await loadMap();
  for (const key of keys) {
    if (map[key]) {
      return map[key];
    }
  }
  return '';
};

export const saveProfileImageForAccount = async (identity: AccountIdentity, imageUri: string) => {
  const keys = buildAccountKeys(identity);
  if (!keys.length || !imageUri) return;

  const map = await loadMap();
  for (const key of keys) {
    map[key] = imageUri;
  }
  await saveMap(map);
};
