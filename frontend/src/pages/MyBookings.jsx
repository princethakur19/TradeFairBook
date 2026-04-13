import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import {
  cancelUserBooking,
  createBookingPaymentOrder,
  getUserBookings,
  requestBookingRefund,
  verifyBookingPayment
} from "../services/bookingService";
import { getLoggedInUserId } from "../utils/auth";
import "../styles/layout.css";
import "../styles/myBookings.css";

const getStatusClassName = (status) => String(status || "").toLowerCase();
const getRefundStatus = (refundStatus) => String(refundStatus || "NONE").toUpperCase();
const hasCompletedPayment = (booking) =>
  Boolean(booking?.paidAt || booking?.paymentId);
const getBookingStatusLabel = (booking) => {
  const normalizedStatus = String(booking?.status || "").toUpperCase();
  const refundStatus = getRefundStatus(booking?.refundStatus);
  const paymentCompleted = hasCompletedPayment(booking) || normalizedStatus === "PAID";

  if (refundStatus === "REQUESTED") return "Refund Requested";
  if (normalizedStatus === "REFUNDED" || refundStatus === "REFUNDED") return "Refunded";

  if (normalizedStatus === "APPROVED") return "Payment Pending";
  if (normalizedStatus === "PAID") return "Payment Confirmed";
  if (normalizedStatus === "CANCELLED" && paymentCompleted) return "Cancelled";

  return normalizedStatus || "PENDING";
};

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

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const existingScript = document.querySelector('script[data-razorpay-checkout="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.Razorpay), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Razorpay checkout.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
    document.body.appendChild(script);
  });

const getBookingStageNote = (booking) => {
  const normalizedStatus = String(booking?.status || "").toUpperCase();
  const refundStatus = getRefundStatus(booking?.refundStatus);
  const paymentCompleted = hasCompletedPayment(booking) || normalizedStatus === "PAID";

  if (normalizedStatus === "APPROVED") {
    return "Payment is pending. This booking is approved and ready for payment.";
  }

  if (normalizedStatus === "REFUNDED") {
    return "Refund processed successfully. The refunded amount will be settled by admin.";
  }

  if (normalizedStatus === "REJECTED") {
    return "This booking was rejected by admin. Payment is not available.";
  }

  if (normalizedStatus === "CANCELLED" && paymentCompleted && refundStatus === "REQUESTED") {
    return "Refund request is pending admin review.";
  }

  if (normalizedStatus === "CANCELLED" && paymentCompleted && refundStatus === "REJECTED") {
    return "Refund request was rejected. You can contact admin or request again with details.";
  }

  if (normalizedStatus === "CANCELLED" && paymentCompleted) {
    return "Booking cancelled. You can request refund now.";
  }

  if (normalizedStatus === "CANCELLED") {
    return "This booking has been cancelled.";
  }

  if (normalizedStatus === "PAID") {
    return "Payment confirmed successfully.";
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
  const [activeRefundId, setActiveRefundId] = useState("");
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
      const response = await cancelUserBooking(bookingId);
      setMessage(response?.message || "Booking cancelled successfully.");
      await loadBookings();
    } catch (cancelError) {
      setError(cancelError.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setActiveCancelId("");
    }
  };

  const handleRequestRefund = async (booking) => {
    const refundReason = window.prompt(
      "Enter refund reason (required). Example: Event schedule change."
    );

    if (refundReason === null) {
      return;
    }

    const normalizedReason = String(refundReason || "").trim();
    if (!normalizedReason) {
      setError("Refund reason is required.");
      return;
    }

    try {
      setActiveRefundId(booking._id);
      setError("");
      setMessage("");
      const response = await requestBookingRefund(booking._id, normalizedReason);
      setMessage(response?.message || "Refund request submitted successfully.");
      await loadBookings();
    } catch (refundError) {
      setError(refundError.response?.data?.message || "Unable to request refund right now.");
    } finally {
      setActiveRefundId("");
    }
  };

  const handlePayNow = async (booking) => {
    let checkoutOpened = false;

    try {
      setActivePayId(booking._id);
      setError("");
      setMessage("");

      await loadRazorpayCheckout();
      const orderResponse = await createBookingPaymentOrder(booking._id);

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout is unavailable right now.");
      }

      const razorpay = new window.Razorpay({
        key: orderResponse.keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency || "INR",
        name: "TradeFairBook",
        description: orderResponse.bookingTitle || "Stall booking payment",
        order_id: orderResponse.orderId,
        handler: async (paymentResponse) => {
          try {
            const verificationResponse = await verifyBookingPayment(booking._id, paymentResponse);
            setMessage(verificationResponse.message || "Payment completed successfully.");
            await loadBookings();
          } catch (verificationError) {
            setError(
              verificationError.response?.data?.message ||
              verificationError.message ||
              "Payment was captured, but verification failed."
            );
          } finally {
            setActivePayId("");
          }
        },
        modal: {
          ondismiss: () => {
            setActivePayId("");
          }
        },
        prefill: {
          name: orderResponse.customer?.name || "",
          email: orderResponse.customer?.email || ""
        },
        notes: {
          bookingId: orderResponse.bookingId
        },
        theme: {
          color: "#0f766e"
        }
      });

      razorpay.on("payment.failed", (event) => {
        setError(event?.error?.description || "Payment failed. Please try again.");
        setActivePayId("");
      });

      razorpay.open();
      checkoutOpened = true;
    } catch (paymentError) {
      setError(
        paymentError.response?.data?.message ||
        paymentError.message ||
        "Unable to start payment right now."
      );
    } finally {
      if (!checkoutOpened) {
        setActivePayId("");
      }
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
                const refundStatus = getRefundStatus(booking.refundStatus);
                const paymentCompleted = hasCompletedPayment(booking) || normalizedStatus === "PAID";
                const isTerminal = ["CANCELLED", "REJECTED", "REFUNDED"].includes(normalizedStatus);
                const canPayNow = normalizedStatus === "APPROVED";
                const canRequestRefund =
                  normalizedStatus === "CANCELLED"
                  && paymentCompleted
                  && !["REQUESTED", "REFUNDED"].includes(refundStatus);

                return (
                  <article className="booking-card" key={booking._id}>
                    <div className="booking-card-top">
                      <div>
                        <h2>{booking.dome?.domeName || "Unknown Dome"}</h2>
                        <p>{booking.dome?.location || "Location unavailable"}</p>
                      </div>
                      <span className={`booking-status-pill ${getStatusClassName(booking.status)}`}>
                        {getBookingStatusLabel(booking)}
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
                      <div>
                        <span>Refund Status</span>
                        <strong>{refundStatus}</strong>
                      </div>
                      {(normalizedStatus === "REFUNDED" || refundStatus === "REQUESTED") ? (
                        <div>
                          <span>Refund Amount</span>
                          <strong>{formatInr(booking.refundAmount || 0)}</strong>
                        </div>
                      ) : null}
                      {(normalizedStatus === "REFUNDED" || refundStatus === "REQUESTED") ? (
                        <div>
                          <span>Deduction</span>
                          <strong>
                            {formatInr(booking.refundDeductionAmount || 0)}
                            {Number(booking.refundPercent || 0)
                              ? ` (${booking.refundPercent}%)`
                              : ""}
                          </strong>
                        </div>
                      ) : null}
                    </div>

                    <div className={`booking-stage-note ${getStatusClassName(booking.status)}`}>
                      {getBookingStageNote(booking)}
                    </div>

                    <div className="booking-card-actions">
                      {canPayNow ? (
                        <button
                          type="button"
                          className="btn-primary booking-action-btn"
                          onClick={() => handlePayNow(booking)}
                          disabled={activePayId === booking._id}
                        >
                          {activePayId === booking._id ? "Opening..." : "Pay Now"}
                        </button>
                      ) : null}

                      {canRequestRefund ? (
                        <button
                          type="button"
                          className="btn-primary booking-action-btn"
                          onClick={() => handleRequestRefund(booking)}
                          disabled={activeRefundId === booking._id}
                        >
                          {activeRefundId === booking._id ? "Submitting..." : "Request Refund"}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        className="btn-secondary booking-action-btn"
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={isTerminal || activeCancelId === booking._id}
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
