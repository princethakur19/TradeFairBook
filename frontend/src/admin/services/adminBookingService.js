import api from "../../api/axios";
import { getStoredUser } from "../../utils/auth";

const readLocalFallbackBookings = () => {
  try {
    const bookings = JSON.parse(sessionStorage.getItem("fallbackBookings") || "[]");
    const user = getStoredUser();
    return Array.isArray(bookings)
      ? bookings.map((booking) => ({
          ...booking,
          user: booking.user?.fullname
            ? booking.user
            : { _id: booking.user?._id || booking.user, fullname: user?.fullname || "", email: user?.email || "" }
        }))
      : [];
  } catch {
    return [];
  }
};

export const getAdminBookings = async (params = {}) => {
  const response = await api.get("/admin/bookings", { params });
  const result = response.data;
  if (!result?.fallback) return result;

  const mergedById = new Map();
  [...(Array.isArray(result.data) ? result.data : []), ...readLocalFallbackBookings()].forEach((booking) => {
    const id = String(booking._id);
    const previous = mergedById.get(id);
    mergedById.set(id, {
      ...previous,
      ...booking,
      user: booking.user?.fullname ? booking.user : previous?.user || booking.user
    });
  });
  const merged = [...mergedById.values()];
  const status = String(params.status || "ALL").toUpperCase();
  const dome = String(params.dome || "ALL");
  const filtered = merged
    .filter((booking) => status === "ALL" || String(booking.status || "").toUpperCase() === status || (status === "APPROVED" && String(booking.status).toUpperCase() === "PAID"))
    .filter((booking) => dome === "ALL" || String(booking.dome?._id || booking.dome) === dome)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  const page = Math.max(Number(params.page) || 1, 1);
  const limit = Math.max(Number(params.limit) || 10, 1);
  const total = Math.max(Number(result.total) || 0, filtered.length);

  return {
    ...result,
    total,
    totalPages: Math.ceil(total / limit),
    count: filtered.slice((page - 1) * limit, page * limit).length,
    data: filtered.slice((page - 1) * limit, page * limit)
  };
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

export const approveRefundRequest = async (id, note = "") => {
  const response = await api.put(`/admin/bookings/${id}/refund/approve`, { note });
  return response.data;
};

export const rejectRefundRequest = async (id, note = "") => {
  const response = await api.put(`/admin/bookings/${id}/refund/reject`, { note });
  return response.data;
};
