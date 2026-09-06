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
  return response.data;
};

export const createBookingPaymentOrder = async (bookingId) => {
  const response = await api.post(`/bookings/${bookingId}/payment/order`);
  return response.data;
};

export const verifyBookingPayment = async (bookingId, paymentPayload) => {
  const response = await api.post(`/bookings/${bookingId}/payment/verify`, paymentPayload);
  return response.data;
};

export const requestBookingRefund = async (bookingId, reason) => {
  const response = await api.post(`/bookings/${bookingId}/refund/request`, { reason });
  return response.data;
};
