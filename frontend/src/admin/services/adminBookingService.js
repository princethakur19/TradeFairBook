import api from "../../api/axios";

export const getAdminBookings = async (params = {}) => {
  const response = await api.get("/admin/bookings", { params });
  return response.data;
};

export const approveBooking = async (id) => {
  const response = await api.put(`/admin/bookings/${id}/approve`);
  return response.data;
};

export const rejectBooking = async (id) => {
  const response = await api.put(`/admin/bookings/${id}/reject`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.put(`/admin/bookings/${id}/cancel`);
  return response.data;
};
