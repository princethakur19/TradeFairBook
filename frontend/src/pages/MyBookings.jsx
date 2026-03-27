import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { cancelUserBooking, getUserBookings } from "../services/bookingService";
import { getLoggedInUserId } from "../utils/auth";
import "../styles/layout.css";
import "../styles/myBookings.css";

const getStatusClassName = (status) => String(status || "").toLowerCase();

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const formatDate = (value) => {
  if (!value) return "N/A";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getBookingStageNote = (status) => {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "APPROVED") {
    return "Approved by admin. You can continue to payment now.";
  }

  if (normalizedStatus === "REJECTED") {
    return "This booking was rejected by admin. Payment is not available.";
  }

  if (normalizedStatus === "CANCELLED") {
    return "This booking has been cancelled.";
  }

  if (normalizedStatus === "PAID") {
    return "Payment completed successfully.";
  }

  return "Pending admin approval. Payment will unlock after approval.";
};

const MyBookings = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeCancelId, setActiveCancelId] = useState("");
  const [activePayId, setActivePayId] = useState("");
  const successMessageFromRoute = useMemo(
    () => location.state?.message || "",
    [location.state]
  );

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getLoggedInUserId();
      if (!userId) {
        setBookings([]);
        setError("Unable to find the logged in user.");
        return;
      }

      const response = await getUserBookings(userId);
      setBookings(Array.isArray(response?.data) ? response.data : []);
    } catch (fetchError) {
      setBookings([]);
      setError(fetchError.response?.data?.message || "Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (successMessageFromRoute) {
      setMessage(successMessageFromRoute);
    }
  }, [successMessageFromRoute]);

  const handleCancelBooking = async (bookingId) => {
    try {
      setActiveCancelId(bookingId);
      setError("");
      setMessage("");
      await cancelUserBooking(bookingId);
      setMessage("Booking cancelled successfully.");
      await loadBookings();
    } catch (cancelError) {
      setError(cancelError.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setActiveCancelId("");
    }
  };

  const handlePayNow = async (bookingId) => {
    try {
      setActivePayId(bookingId);
      setError("");
      setMessage("Razorpay integration will be connected here next. This booking is approved and ready for payment.");
    } finally {
      setActivePayId("");
    }
  };

  return (
    <div className="home-wrapper">
      <Navbar />

      <main className="profile-page bookings-page">
        <section className="profile-card bookings-shell">
          <div className="bookings-header">
            <div>
              <h1>My Bookings</h1>
              <p>All stalls booked under your account are shown here.</p>
            </div>
            <span className="bookings-count">{bookings.length} Booking{bookings.length === 1 ? "" : "s"}</span>
          </div>

          {message ? <p className="bookings-feedback bookings-feedback-success">{message}</p> : null}
          {error ? <p className="bookings-feedback bookings-feedback-error">{error}</p> : null}

          {loading ? (
            <div className="bookings-empty-state">Loading your bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="bookings-empty-state">You have not booked any stalls yet.</div>
          ) : (
            <div className="bookings-grid">
              {bookings.map((booking) => {
                const normalizedStatus = String(booking.status || "").toUpperCase();
                const isTerminal = ["CANCELLED", "REJECTED"].includes(normalizedStatus);
                const canPayNow = normalizedStatus === "APPROVED";

                return (
                  <article className="booking-card" key={booking._id}>
                    <div className="booking-card-top">
                      <div>
                        <h2>{booking.dome?.domeName || "Unknown Dome"}</h2>
                        <p>{booking.dome?.location || "Location unavailable"}</p>
                      </div>
                      <span className={`booking-status-pill ${getStatusClassName(booking.status)}`}>
                        {booking.status || "PENDING"}
                      </span>
                    </div>

                    <div className="booking-info-grid">
                      <div className="booking-info-item">
                        <span>Stall Number</span>
                        <strong>{booking.stall?.stallNumber || "N/A"}</strong>
                      </div>
                      <div className="booking-info-item">
                        <span>Side</span>
                        <strong>{booking.stall?.side || "N/A"}</strong>
                      </div>
                      <div className="booking-info-item">
                        <span>Total Amount</span>
                        <strong>{formatInr(booking.grandTotal || booking.amount)}</strong>
                      </div>
                      <div className="booking-info-item">
                        <span>Booked On</span>
                        <strong>{formatDate(booking.createdAt)}</strong>
                      </div>
                    </div>

                    <div className="booking-material-summary">
                      <div>
                        <span>Included Materials</span>
                        <strong>{Array.isArray(booking.defaultMaterials) ? booking.defaultMaterials.length : 0}</strong>
                      </div>
                      <div>
                        <span>Extra Materials</span>
                        <strong>{Array.isArray(booking.extraMaterials) ? booking.extraMaterials.length : 0}</strong>
                      </div>
                      <div>
                        <span>Extra Material Cost</span>
                        <strong>{formatInr(booking.extraMaterialShare || booking.extraMaterialTotal || 0)}</strong>
                      </div>
                    </div>

                    <div className={`booking-stage-note ${getStatusClassName(booking.status)}`}>
                      {getBookingStageNote(booking.status)}
                    </div>

                    <div className="booking-card-actions">
                      {canPayNow ? (
                        <button
                          type="button"
                          className="btn-primary booking-action-btn"
                          onClick={() => handlePayNow(booking._id)}
                          disabled={activePayId === booking._id}
                        >
                          {activePayId === booking._id ? "Opening..." : "Pay Now"}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="btn-secondary booking-action-btn"
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={isTerminal || activeCancelId === booking._id || normalizedStatus === "PAID"}
                      >
                        {activeCancelId === booking._id ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
