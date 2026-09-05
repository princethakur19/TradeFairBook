const fallbackBookingsByUser = new Map();

const clone = (value) => JSON.parse(JSON.stringify(value));

const saveFallbackBookings = (userId, bookings) => {
  const normalizedUserId = String(userId || "");
  const bookingList = Array.isArray(bookings) ? bookings : [bookings];
  const existingBookings = fallbackBookingsByUser.get(normalizedUserId) || [];

  fallbackBookingsByUser.set(normalizedUserId, [
    ...bookingList.map(clone),
    ...existingBookings
  ]);
};

const getFallbackBookings = (userId) => clone(fallbackBookingsByUser.get(String(userId || "")) || []);

module.exports = {
  saveFallbackBookings,
  getFallbackBookings
};
