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

const updateFallbackBooking = (bookingId, updater) => {
  const normalizedBookingId = String(bookingId || "");

  if (!normalizedBookingId || typeof updater !== "function") {
    return null;
  }

  for (const [userId, bookings] of fallbackBookingsByUser.entries()) {
    const bookingIndex = bookings.findIndex((booking) => String(booking?._id || "") === normalizedBookingId);

    if (bookingIndex === -1) {
      continue;
    }

    const currentBooking = clone(bookings[bookingIndex]);
    const changes = updater(currentBooking);

    if (!changes) {
      return currentBooking;
    }

    const nextBooking = {
      ...bookings[bookingIndex],
      ...changes,
      updatedAt: new Date().toISOString()
    };
    const nextBookings = [...bookings];
    nextBookings[bookingIndex] = nextBooking;
    fallbackBookingsByUser.set(userId, nextBookings);

    return clone(nextBooking);
  }

  return null;
};

const getFallbackBookings = (userId) => clone(fallbackBookingsByUser.get(String(userId || "")) || []);
const getAllFallbackBookings = () => clone([...fallbackBookingsByUser.values()].flat());

module.exports = {
  getAllFallbackBookings,
  updateFallbackBooking,
  saveFallbackBookings,
  getFallbackBookings
};
