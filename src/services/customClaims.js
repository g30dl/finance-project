const STORAGE_KEYS = {
  firebaseUid: 'firebase_uid',
  userIdMap: 'user_id_map',
  uidByUserId: 'firebase_uid_by_user',
  rolesByUid: 'firebase_roles_by_uid',
};

const safeStorage = {
  get(key) {
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  set(key, value) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  },
  remove(key) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      return;
    }
  },
};

const readJson = (key, fallback) => {
  const raw = safeStorage.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    safeStorage.set(key, JSON.stringify(value));
  } catch (error) {
    // noop
  }
};

export const getUserFirebaseUID = (userId) => {
  const map = readJson(STORAGE_KEYS.uidByUserId, {});
  return map[userId] || null;
};

export const storeUserMapping = (userId, firebaseUID) => {
  if (!userId || !firebaseUID) return firebaseUID;

  const map = readJson(STORAGE_KEYS.uidByUserId, {});
  map[userId] = firebaseUID;
  writeJson(STORAGE_KEYS.uidByUserId, map);

  safeStorage.set(STORAGE_KEYS.firebaseUid, firebaseUID);
  safeStorage.set(STORAGE_KEYS.userIdMap, userId);

  return firebaseUID;
};

export const getOrCreateMapping = (userId, firebaseUID) => {
  const existing = getUserFirebaseUID(userId);
  if (existing) {
    safeStorage.set(STORAGE_KEYS.firebaseUid, existing);
    safeStorage.set(STORAGE_KEYS.userIdMap, userId);
    return existing;
  }
  return storeUserMapping(userId, firebaseUID);
};

export const storeUserRole = (firebaseUID, role) => {
  if (!firebaseUID || !role) return role;
  const roles = readJson(STORAGE_KEYS.rolesByUid, {});
  roles[firebaseUID] = role;
  writeJson(STORAGE_KEYS.rolesByUid, roles);
  return role;
};

export const getStoredRole = (firebaseUID) => {
  if (!firebaseUID) return null;
  const roles = readJson(STORAGE_KEYS.rolesByUid, {});
  return roles[firebaseUID] || null;
};

export const getStoredFirebaseUID = () => safeStorage.get(STORAGE_KEYS.firebaseUid);

export const clearUserMapping = () => {
  safeStorage.remove(STORAGE_KEYS.firebaseUid);
  safeStorage.remove(STORAGE_KEYS.userIdMap);
};

export const CUSTOM_CLAIMS_STORAGE_KEYS = STORAGE_KEYS;
