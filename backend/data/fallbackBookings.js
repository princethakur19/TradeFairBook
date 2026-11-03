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

const getAllFallbackBookings = () =>
  [...fallbackBookingsByUser.values()].flatMap((bookings) => clone(bookings));

const updateFallbackBooking = (bookingId, updates) => {
  for (const [userId, bookings] of fallbackBookingsByUser.entries()) {
    const bookingIndex = bookings.findIndex((booking) => String(booking._id) === String(bookingId));
    if (bookingIndex < 0) continue;

    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    fallbackBookingsByUser.set(userId, bookings);
    return clone(bookings[bookingIndex]);
  }

  return null;
};

module.exports = {
  saveFallbackBookings,
  getFallbackBookings,
  getAllFallbackBookings,
  updateFallbackBooking
};
