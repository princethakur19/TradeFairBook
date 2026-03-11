const Booking = require("../models/Booking");
const Stall = require("../models/Stall");
const AadhaarVerification = require("../models/AadhaarVerification");
const Material = require("../models/Material");

const BOOKING_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const ACTIVE_BOOKING_STATUSES = ["PENDING", "APPROVED", "PAID"];
const TERMINAL_BOOKING_STATUSES = ["REJECTED", "CANCELLED"];
const DEFAULT_INCLUDED_MATERIALS = Object.freeze([
  { name: "Table", quantity: 1, price: 0, subtotal: 0 },
  { name: "Chair", quantity: 2, price: 0, subtotal: 0 },
  { name: "Fan", quantity: 1, price: 0, subtotal: 0 },
  { name: "Light", quantity: 1, price: 0, subtotal: 0 }
]);

const bookingPopulate = [
  { path: "user", select: "fullname email" },
  { path: "stall", select: "stallNumber side price" },
  { path: "dome", select: "domeName location" },
  { path: "aadhaarVerification", select: "-aadhaarNumber" }
];

const normalizeStatus = (value) => String(value || "").toUpperCase();
const toObjectIdString = (value) => String(value || "").trim();
const toPositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};
const distributeAmountAcrossBookings = (total, count) => {
  if (!count) return [];
  const normalizedTotal = Math.max(0, Math.round(Number(total) || 0));
  const baseShare = Math.floor(normalizedTotal / count);
  let remainder = normalizedTotal % count;

  return Array.from({ length: count }, () => {
    const share = baseShare + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return share;
  });
};

const syncStallStatusForBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId).select("stall");
  if (!booking?.stall) return;

  const activeCount = await Booking.countDocuments({
    stall: booking.stall,
    status: { $in: ACTIVE_BOOKING_STATUSES }
  });

  await Stall.findByIdAndUpdate(booking.stall, {
    status: activeCount > 0 ? "BOOKED" : "AVAILABLE"
  });
};

/* ===============================
   CREATE BOOKING
================================= */
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      stall,
      stallIds,
      status,
      aadhaarVerificationId,
      defaultMaterials,
      extraMaterials
    } = req.body || {};
    const normalizedStatus = normalizeStatus(status || "PENDING");
    const requestedStallIds = Array.isArray(stallIds) ? stallIds : stall ? [stall] : [];
    const normalizedStallIds = [...new Set(requestedStallIds.map(toObjectIdString).filter(Boolean))];

    if (!userId || !normalizedStallIds.length || !aadhaarVerificationId) {
      return res.status(400).json({
        success: false,
        message: "User, at least one stall and aadhaarVerificationId are required"
      });
    }

    if (!BOOKING_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status"
      });
    }

    const aadhaarVerification = await AadhaarVerification.findOne({
      _id: aadhaarVerificationId,
      user: userId
    });

    if (!aadhaarVerification) {
      return res.status(404).json({
        success: false,
        message: "Aadhaar verification record not found for this user"
      });
    }

    const stallDocs = await Stall.find({ _id: { $in: normalizedStallIds } }).select("price dome");
    if (stallDocs.length !== normalizedStallIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more selected stalls were not found"
      });
    }

    const uniqueDomeIds = [...new Set(stallDocs.map((stallDoc) => String(stallDoc.dome)))];
    if (uniqueDomeIds.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Please select stalls from a single dome in one booking request"
      });
    }

    const normalizedDefaultMaterials = Array.isArray(defaultMaterials) && defaultMaterials.length
      ? defaultMaterials
        .map((item) => ({
          name: String(item?.name || "").trim(),
          quantity: toPositiveInteger(item?.quantity),
          price: 0,
          subtotal: 0
        }))
        .filter((item) => item.name && item.quantity > 0)
      : DEFAULT_INCLUDED_MATERIALS;

    const requestedExtraMaterials = Array.isArray(extraMaterials)
      ? extraMaterials
        .map((item) => ({
          materialId: toObjectIdString(item?.materialId),
          quantity: toPositiveInteger(item?.quantity)
        }))
        .filter((item) => item.materialId && item.quantity > 0)
      : [];

    let normalizedExtraMaterials = [];
    let extraMaterialTotal = 0;

    if (requestedExtraMaterials.length) {
      const requestedMaterialIds = [...new Set(requestedExtraMaterials.map((item) => item.materialId))];
      const materialDocs = await Material.find({
        _id: { $in: requestedMaterialIds },
        dome: uniqueDomeIds[0],
        isActive: true
      }).select("name price");

      if (materialDocs.length !== requestedMaterialIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more extra materials are invalid or unavailable for this dome"
        });
      }

      const materialMap = new Map(materialDocs.map((doc) => [String(doc._id), doc]));
      normalizedExtraMaterials = requestedExtraMaterials.map((item) => {
        const materialDoc = materialMap.get(item.materialId);
        const price = Number(materialDoc.price || 0);
        const subtotal = price * item.quantity;
        extraMaterialTotal += subtotal;

        return {
          materialId: materialDoc._id,
          name: materialDoc.name,
          price,
          quantity: item.quantity,
          subtotal
        };
      });
    }

    const existingBookings = await Booking.find({
      stall: { $in: normalizedStallIds },
      status: { $in: ACTIVE_BOOKING_STATUSES }
    }).select("stall");

    if (existingBookings.length) {
      const blockedIds = new Set(existingBookings.map((booking) => String(booking.stall)));
      const blockedStalls = normalizedStallIds.filter((stallId) => blockedIds.has(stallId));
      return res.status(400).json({
        success: false,
        message:
          blockedStalls.length === 1
            ? "Selected stall is already booked"
            : "Some selected stalls are already booked",
        bookedStallIds: blockedStalls
      });
    }

    const stallDocMap = new Map(stallDocs.map((stallDoc) => [String(stallDoc._id), stallDoc]));
    const distributedExtraShares = distributeAmountAcrossBookings(
      extraMaterialTotal,
      normalizedStallIds.length
    );
    const bookingsPayload = normalizedStallIds.map((stallId) => {
      const stallDoc = stallDocMap.get(stallId);
      const stallPrice = Number(stallDoc.price || 0);
      const extraMaterialShare = distributedExtraShares.shift() || 0;
      return {
        user: userId,
        stall: stallId,
        dome: stallDoc.dome,
        stallPrice,
        amount: stallPrice + extraMaterialShare,
        defaultMaterials: normalizedDefaultMaterials,
        extraMaterials: normalizedExtraMaterials,
        extraMaterialTotal,
        extraMaterialShare,
        grandTotal: stallPrice + extraMaterialShare,
        aadhaarVerification: aadhaarVerification._id,
        status: normalizedStatus
      };
    });

    const createdBookings = await Booking.insertMany(bookingsPayload);
    await Promise.all(createdBookings.map((booking) => syncStallStatusForBooking(booking._id)));

    const createdBookingIds = createdBookings.map((booking) => booking._id);
    const populatedBookings = await Booking.find({ _id: { $in: createdBookingIds } })
      .populate(bookingPopulate)
      .sort({ createdAt: -1 });

    return res.status(201).json({
      success: true,
      message:
        populatedBookings.length === 1
          ? "Booking created successfully"
          : `${populatedBookings.length} bookings created successfully`,
      count: populatedBookings.length,
      data: populatedBookings.length === 1 ? populatedBookings[0] : populatedBookings
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   GET USER BOOKINGS
================================= */
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (String(req.user?.role || "").toUpperCase() === "USER" && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these bookings"
      });
    }

    const bookings = await Booking.find({ user: userId })
      .populate(bookingPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error("Get User Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   GET ALL BOOKINGS (ADMIN - LEGACY API)
================================= */
exports.getAllBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find()
      .populate(bookingPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   UPDATE BOOKING STATUS (LEGACY API)
================================= */
exports.updateBookingStatus = async (req, res) => {
  try {
    const rawStatus = req.body?.status;
    const normalizedStatus = normalizeStatus(rawStatus === "PAID" ? "APPROVED" : rawStatus);

    if (!BOOKING_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    booking.status = normalizedStatus;
    await booking.save();
    await syncStallStatusForBooking(booking._id);

    const updatedBooking = await Booking.findById(booking._id).populate(bookingPopulate);

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   CANCEL BOOKING (USER OR ADMIN)
================================= */
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const role = String(req.user?.role || "").toUpperCase();
    const canManageAll = role === "ADMIN" || role === "SUPER_ADMIN";
    if (!canManageAll && String(booking.user) !== String(req.user?.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this booking"
      });
    }

    booking.status = "CANCELLED";
    await booking.save();
    await syncStallStatusForBooking(booking._id);

    const updatedBooking = await Booking.findById(booking._id).populate(bookingPopulate);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedBooking
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.BOOKING_STATUSES = BOOKING_STATUSES;
exports.ACTIVE_BOOKING_STATUSES = ACTIVE_BOOKING_STATUSES;
exports.TERMINAL_BOOKING_STATUSES = TERMINAL_BOOKING_STATUSES;
