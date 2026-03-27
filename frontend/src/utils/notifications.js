const getApprovedNotificationStorageKey = (userId) =>
  `tradefairbook:seen-approved-bookings:${userId}`;

const parseStoredIds = (value) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (_error) {
    return [];
  }
};

export const getSeenApprovedBookingIds = (userId) => {
  if (!userId) return [];
  return parseStoredIds(localStorage.getItem(getApprovedNotificationStorageKey(userId)));
};

export const markApprovedBookingsSeen = (userId, bookingIds = []) => {
  if (!userId || !bookingIds.length) return;

  const existingIds = new Set(getSeenApprovedBookingIds(userId));
  bookingIds.forEach((bookingId) => {
    if (bookingId) existingIds.add(String(bookingId));
  });

  localStorage.setItem(
    getApprovedNotificationStorageKey(userId),
    JSON.stringify([...existingIds])
  );
};
