import api from "../api/axios";

const FALLBACK_BOOKINGS_KEY = "fallbackBookings";

const readFallbackBookings = () => {
  try {
    return JSON.parse(sessionStorage.getItem(FALLBACK_BOOKINGS_KEY) || "[]");
  } catch (_error) {
    return [];
  }
};

const writeFallbackBookings = (bookings) => {
  sessionStorage.setItem(FALLBACK_BOOKINGS_KEY, JSON.stringify(bookings));
};

const updateLocalFallbackBooking = (bookingId, updates) => {
  const bookings = readFallbackBookings();
  const updated = bookings.map((booking) => String(booking._id) === String(bookingId)
    ? { ...booking, ...updates, updatedAt: new Date().toISOString() }
    : booking);
  writeFallbackBookings(updated);
};

export const rememberFallbackBooking = (bookingResponse) => {
  if (!bookingResponse?.fallback || !bookingResponse?.data) return;

  const createdBookings = Array.isArray(bookingResponse.data)
    ? bookingResponse.data
    : [bookingResponse.data];

  writeFallbackBookings([
    ...createdBookings,
    ...readFallbackBookings()
  ]);
};

export const getUserBookings = async (userId) => {
  try {
    const response = await api.get(`/bookings/user/${userId}`);
    const serverBookings = Array.isArray(response.data?.data) ? response.data.data : [];
    const localBookings = readFallbackBookings();
    const mergedBookings = [
      ...serverBookings,
      ...localBookings.filter((localBooking) =>
        !serverBookings.some((serverBooking) => serverBooking._id === localBooking._id)
      )
    ];

    return {
      ...response.data,
      count: mergedBookings.length,
      data: mergedBookings
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);

    return {
      success: true,
      count: readFallbackBookings().length,
      data: readFallbackBookings(),
      fallback: true
    };
  }
};

export const cancelUserBooking = async (bookingId) => {
  const response = await api.delete(`/bookings/${bookingId}`);
  updateLocalFallbackBooking(bookingId, { status: "CANCELLED" });
  return response.data;
};

export const createBookingPaymentOrder = async (booking) => {
  const bookingId = typeof booking === "object" ? booking?._id : booking;
  const response = await api.post(`/bookings/${bookingId}/payment/order`, {
    fallbackBooking: typeof booking === "object" ? booking : undefined
  });
  updateLocalFallbackBooking(bookingId, { paymentOrderId: response.data?.orderId });
  return response.data;
};

export const verifyBookingPayment = async (bookingId, paymentPayload) => {
  const response = await api.post(`/bookings/${bookingId}/payment/verify`, paymentPayload);
  updateLocalFallbackBooking(bookingId, response.data?.data || { status: "PAID" });
  return response.data;
};

export const requestBookingRefund = async (bookingId, reason) => {
  const response = await api.post(`/bookings/${bookingId}/refund/request`, { reason });
  updateLocalFallbackBooking(bookingId, response.data?.data || { refundStatus: "REQUESTED" });
  return response.data;
};
