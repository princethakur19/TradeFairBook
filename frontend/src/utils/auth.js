const decodeJwtPayload = (token) => {
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`;
    const json = atob(paddedBase64);

    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("user");
};

export const hasValidSession = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    clearAuthStorage();
    return false;
  }

  return true;
};

export const getLoggedInUserId = () => {
  if (!hasValidSession()) return null;

  const directUserId = localStorage.getItem("userId");
  if (directUserId) return directUserId;

  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const parsedUser = JSON.parse(rawUser);
      const parsedUserId = parsedUser?._id || parsedUser?.id || parsedUser?.userId;
      if (parsedUserId) return parsedUserId;
    } catch (error) {
      // Ignore parse errors and continue with token fallback.
    }
  }

  const token = localStorage.getItem("token");
  const payload = decodeJwtPayload(token);
  return payload?._id || payload?.id || payload?.userId || null;
};
