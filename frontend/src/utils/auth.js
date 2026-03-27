const AUTH_KEYS = ["token", "role", "userId", "user", "redirectAfterLogin"];

export const decodeJwtPayload = (token) => {
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    const json = atob(paddedBase64);

    return JSON.parse(json);
  } catch (_error) {
    return null;
  }
};

export const getAuthStorage = () => sessionStorage;

export const getAuthItem = (key) => getAuthStorage().getItem(key);

export const setAuthItem = (key, value) => {
  if (value === undefined || value === null) {
    getAuthStorage().removeItem(key);
    return;
  }

  getAuthStorage().setItem(key, String(value));
};

export const removeAuthItem = (key) => getAuthStorage().removeItem(key);

export const clearAuthStorage = () => {
  AUTH_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
};

export const persistAuthSession = ({ token, role, user }) => {
  clearAuthStorage();

  setAuthItem("token", token);
  setAuthItem("role", role);

  if (user) {
    setAuthItem("user", JSON.stringify(user));
    const userId = user.id || user._id || user.userId;
    if (userId) {
      setAuthItem("userId", userId);
    }
  }
};

export const migrateLegacyAuthStorage = () => {
  const hasSessionToken = sessionStorage.getItem("token");
  const legacyToken = localStorage.getItem("token");

  if (!hasSessionToken && legacyToken) {
    AUTH_KEYS.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        sessionStorage.setItem(key, value);
      }
    });
  }

  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const hasValidSession = () => {
  const token = getAuthItem("token");
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) {
    clearAuthStorage();
    return false;
  }

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    clearAuthStorage();
    return false;
  }

  return true;
};

export const getLoggedInUserId = () => {
  if (!hasValidSession()) return null;

  const directUserId = getAuthItem("userId");
  if (directUserId) return directUserId;

  const storedUser = getStoredUser();
  if (storedUser) {
    const parsedUserId = storedUser?._id || storedUser?.id || storedUser?.userId;
    if (parsedUserId) return parsedUserId;
  }

  const token = getAuthItem("token");
  const payload = decodeJwtPayload(token);
  return payload?._id || payload?.id || payload?.userId || null;
};

export const getStoredUser = () => {
  const rawUser = getAuthItem("user");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch (_error) {
    return null;
  }
};

export const getStoredRole = () => String(getAuthItem("role") || "").toUpperCase();

export const getRedirectAfterLogin = () => getAuthItem("redirectAfterLogin");

export const setRedirectAfterLogin = (value) => setAuthItem("redirectAfterLogin", value);

export const clearRedirectAfterLogin = () => removeAuthItem("redirectAfterLogin");

export const getUserDisplayName = () => {
  const storedUser = getStoredUser();
  if (storedUser) {
    return (
      storedUser.fullname ||
      storedUser.name ||
      storedUser.email ||
      storedUser.username ||
      ""
    );
  }

  const token = getAuthItem("token");
  const payload = decodeJwtPayload(token);
  if (payload) {
    return (
      payload.fullname ||
      payload.name ||
      payload.email ||
      payload.username ||
      ""
    );
  }

  return "";
};
