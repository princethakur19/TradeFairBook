const ACTIVE_BOOKING_STATUSES = ["PENDING", "APPROVED", "PAID"];
const TERMINAL_BOOKING_STATUSES = ["REJECTED", "CANCELLED", "REFUNDED"];

const normalizeStatus = (value) => String(value || "").trim().toUpperCase();

module.exports = {
  ACTIVE_BOOKING_STATUSES,
  TERMINAL_BOOKING_STATUSES,
  normalizeStatus
};
