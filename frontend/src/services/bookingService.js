import api from "../api/axios";

export const getUserBookings = async (userId) => {
  const response = await api.get(`/bookings/user/${userId}`);
  return response.data;
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
