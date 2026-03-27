import api from "../api/axios";

export const getUserBookings = async (userId) => {
  const response = await api.get(`/bookings/user/${userId}`);
  return response.data;
};

export const cancelUserBooking = async (bookingId) => {
  const response = await api.delete(`/bookings/${bookingId}`);
  return response.data;
};
