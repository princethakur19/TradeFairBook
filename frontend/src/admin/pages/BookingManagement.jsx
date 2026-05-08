import React, { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";
import {
  approveBooking,
  approveRefundRequest,
  cancelBooking,
  getAdminBookings,
  rejectBooking,
  rejectRefundRequest
} from "../services/adminBookingService";

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "PAID", "REJECTED", "CANCELLED", "REFUNDED"];

const getStatusClassName = (status) => String(status || "").toLowerCase();
const getRefundStatus = (refundStatus) => String(refundStatus || "NONE").toUpperCase();
const hasCompletedPayment = (booking) =>
  Boolean(booking?.paidAt || booking?.paymentId);
const getBookingStatusLabel = (bookingOrStatus) => {
  const normalizedStatus = String(
    typeof bookingOrStatus === "string" ? bookingOrStatus : bookingOrStatus?.status || ""
  ).toUpperCase();
  const refundStatus = getRefundStatus(
    typeof bookingOrStatus === "string" ? "NONE" : bookingOrStatus?.refundStatus
  );

  if (refundStatus === "REQUESTED") return "Refund Requested";
  if (normalizedStatus === "REFUNDED" || refundStatus === "REFUNDED") return "Refunded";
  if (normalizedStatus === "APPROVED") return "Payment Pending";
  if (normalizedStatus === "PAID") return "Payment Confirmed";

  return normalizedStatus || "N/A";
};

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [domes, setDomes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDome, setSelectedDome] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchDomes = async () => {
    try {
      const res = await api.get("/domes");
      setDomes(res.data?.data || []);
    } catch {
      setDomes([]);
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAdminBookings({
        page,
        limit,
        status: selectedStatus,
        dome: selectedDome
      });
      const bookingRows = Array.isArray(res?.data) ? res.data : [];
      setBookings(bookingRows);
      setTotalPages(Number(res?.totalPages) || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedStatus, selectedDome]);

  useEffect(() => {
    fetchDomes();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const runAction = async (action, bookingId) => {
    try {
      setMessage("");
      setError("");
      const response = await action(bookingId);
      setMessage(response?.message || "Booking updated successfully.");
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update booking status.");
    }
  };

  const onStatusChange = (e) => {
    setPage(1);
    setSelectedStatus(e.target.value);
  };

  const onDomeChange = (e) => {
    setPage(1);
    setSelectedDome(e.target.value);
  };

  return (
    <div className="admin-fluid-card manage-card">
      <div className="card-header-flex">
        <h2 className="card-title">Booking Management</h2>
        <span className="count-badge">{bookings.length} Rows</span>
      </div>

      <div className="report-filters-row booking-filter-row">
        <select value={selectedStatus} onChange={onStatusChange}>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {getBookingStatusLabel(status)}
            </option>
          ))}
        </select>
        <select value={selectedDome} onChange={onDomeChange}>
          <option value="ALL">All Domes</option>
          {domes.map((dome) => (
            <option key={dome._id} value={dome._id}>
              {dome.domeName}
            </option>
          ))}
        </select>
      </div>

      {message ? <p className="manage-feedback manage-feedback-success">{message}</p> : null}
      {error ? <p className="manage-feedback manage-feedback-error">{error}</p> : null}

      <div className="table-responsive-wrapper booking-table-wrapper">
        <table className="admin-table booking-admin-table">
          <thead>
            <tr>
              <th className="col-user">USER</th>
              <th className="col-email">EMAIL</th>
              <th className="col-dome">DOME</th>
              <th className="col-stall">STALL</th>
              <th className="col-amount">AMOUNT</th>
              <th className="col-status">STATUS</th>
              <th className="col-refund">REFUND</th>
              <th className="col-action">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="empty-table-msg">
                  Loading bookings...
                </td>
              </tr>
            ) : bookings.length ? (
              bookings.map((booking) => {
                const normalizedStatus = String(booking.status || "").toUpperCase();
                const refundStatus = getRefundStatus(booking.refundStatus);
                const paymentCompleted = hasCompletedPayment(booking) || normalizedStatus === "PAID";
                const isPaid = normalizedStatus === "PAID";
                const isRefundRequested = refundStatus === "REQUESTED";
                const isRefunded = normalizedStatus === "REFUNDED";

                return (
                  <tr key={booking._id}>
                    <td className="col-user">{booking.user?.fullname || "N/A"}</td>
                    <td className="col-email">{booking.user?.email || "N/A"}</td>
                    <td className="col-dome">{booking.dome?.domeName || "N/A"}</td>
                    <td className="col-stall">{booking.stall?.stallNumber || "N/A"}</td>
                    <td className="col-amount">{formatInr(booking.grandTotal || booking.amount)}</td>
                    <td className="col-status">
                      <span className={`status-pill booking-status ${getStatusClassName(booking.status)}`}>
                        {getBookingStatusLabel(booking)}
                      </span>
                    </td>
                    <td className="col-refund">
                      {isRefunded ? (
                        <span className="status-pill booking-status refunded">
                          {formatInr(booking.refundAmount || 0)}
                        </span>
                      ) : isRefundRequested ? (
                        <span className="status-pill booking-status pending">
                          Requested
                        </span>
                      ) : refundStatus === "REJECTED" ? (
                        <span className="status-pill booking-status rejected">Rejected</span>
                      ) : (
                        <span className="count-badge">-</span>
                      )}
                    </td>
                    <td className="col-action">
                      {isRefunded ? (
                        <span className="status-pill booking-status refunded">Refunded</span>
                      ) : isRefundRequested ? (
                        <div className="action-buttons booking-action-buttons">
                          <button
                            className="edit-icon-btn save-btn"
                            onClick={() => runAction(approveRefundRequest, booking._id)}
                          >
                            Approve Refund
                          </button>
                          <button
                            className="edit-icon-btn delete-btn"
                            onClick={() => runAction(rejectRefundRequest, booking._id)}
                          >
                            Reject Refund
                          </button>
                        </div>
                      ) : isPaid ? (
                        <span className="status-pill booking-status paid">Paid</span>
                      ) : normalizedStatus === "CANCELLED" && paymentCompleted ? (
                        <span className="status-pill booking-status pending">Awaiting Refund</span>
                      ) : (
                        <div className="action-buttons booking-action-buttons">
                          <button
                            className="edit-icon-btn save-btn"
                            onClick={() => runAction(approveBooking, booking._id)}
                            disabled={normalizedStatus === "APPROVED"}
                          >
                            Approve
                          </button>
                          <button
                            className="edit-icon-btn"
                            onClick={() => runAction(rejectBooking, booking._id)}
                            disabled={normalizedStatus === "REJECTED"}
                          >
                            Reject
                          </button>
                          <button
                            className="edit-icon-btn delete-btn"
                            onClick={() => runAction(cancelBooking, booking._id)}
                            disabled={normalizedStatus === "CANCELLED"}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="empty-table-msg">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="modal-actions">
        <button
          className="edit-icon-btn"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="count-badge">
          Page {page} of {totalPages || 1}
        </span>
        <button
          className="edit-icon-btn"
          onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BookingManagement;
