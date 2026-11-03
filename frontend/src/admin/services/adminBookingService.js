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

const updateLocalFallbackBooking = (id, updates) => {
  try {
    const current = JSON.parse(sessionStorage.getItem("fallbackBookings") || "[]");
    if (!Array.isArray(current)) return;
    sessionStorage.setItem("fallbackBookings", JSON.stringify(current.map((booking) =>
      String(booking._id) === String(id) ? { ...booking, ...updates, updatedAt: new Date().toISOString() } : booking
    )));
  } catch {
    // Local demo bookings are optional; the server response remains authoritative.
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
  updateLocalFallbackBooking(id, { status: "APPROVED" });
  return response.data;
};

export const rejectBooking = async (id) => {
  const response = await api.put(`/admin/bookings/${id}/reject`);
  updateLocalFallbackBooking(id, { status: "REJECTED" });
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.put(`/admin/bookings/${id}/cancel`);
  updateLocalFallbackBooking(id, { status: "CANCELLED" });
  return response.data;
};

export const approveRefundRequest = async (id, note = "") => {
  const response = await api.put(`/admin/bookings/${id}/refund/approve`, { note });
  updateLocalFallbackBooking(id, { status: "REFUNDED", refundStatus: "REFUNDED" });
  return response.data;
};

export const rejectRefundRequest = async (id, note = "") => {
  const response = await api.put(`/admin/bookings/${id}/refund/reject`, { note });
  updateLocalFallbackBooking(id, { refundStatus: "REJECTED" });
  return response.data;
};
