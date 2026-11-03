const Booking = require("../models/Booking");
const User = require("../models/User");
const { getDatabaseErrorMessage } = require("../utils/dbError");
const { getAllFallbackBookings } = require("../data/fallbackBookings");
const defaultDomes = require("../data/defaultDomes");

const REVENUE_BOOKING_STATUSES = ["PAID"];
const isDemoAuthEnabled = () => String(process.env.DEMO_AUTH_ENABLED || "false").toLowerCase() === "true";

const getFallbackStats = () => {
  const bookings = getAllFallbackBookings();
  const countStatus = (status) => bookings.filter((booking) => String(booking.status).toUpperCase() === status).length;
  const revenueByDome = new Map();
  bookings.filter((booking) => String(booking.status).toUpperCase() === "PAID").forEach((booking) => {
    const domeId = String(booking.dome?._id || booking.dome || "");
    const domeName = defaultDomes.find((dome) => dome._id === domeId)?.domeName || "Unknown Dome";
    revenueByDome.set(domeName, (revenueByDome.get(domeName) || 0) + Number(booking.grandTotal ?? booking.amount ?? 0));
  });
  const totalRevenue = bookings
    .filter((booking) => String(booking.status).toUpperCase() === "PAID")
    .reduce((sum, booking) => sum + Number(booking.grandTotal ?? booking.amount ?? 0), 0);

  return {
    totalUsers: new Set(bookings.map((booking) => String(booking.user?._id || booking.user || "")).filter(Boolean)).size || 1,
    totalBookings: bookings.length,
    pendingBookings: countStatus("PENDING"),
    approvedBookings: countStatus("APPROVED"),
    paidBookings: countStatus("PAID"),
    refundedBookings: countStatus("REFUNDED"),
    rejectedBookings: countStatus("REJECTED"),
    totalRevenue,
    revenueByDome: [...revenueByDome.entries()].map(([domeName, revenue]) => ({ domeName, revenue }))
  };
};

exports.getDashboardStats = async (req, res) => {
  try {
    if (isDemoAuthEnabled() && req.user?.demo) {
      return res.status(200).json({
        success: true,
        data: getFallbackStats()
      });
    }

    const [totalUsers, totalBookings, statusCounts, revenueAgg, revenueByDome] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      Booking.aggregate([
        { $match: { status: { $in: REVENUE_BOOKING_STATUSES } } },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $ifNull: ["$grandTotal", "$amount"]
              }
            }
          }
        }
      ]),
      Booking.aggregate([
        { $match: { status: { $in: REVENUE_BOOKING_STATUSES } } },
        {
          $group: {
            _id: "$dome",
            revenue: {
              $sum: {
                $ifNull: ["$grandTotal", "$amount"]
              }
            }
          }
        },
        {
          $lookup: {
            from: "domes",
            localField: "_id",
            foreignField: "_id",
            as: "dome"
          }
        },
        { $unwind: { path: "$dome", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            domeName: { $ifNull: ["$dome.domeName", "Unknown Dome"] },
            revenue: 1
          }
        },
        { $sort: { revenue: -1 } }
      ])
    ]);

    const statusCountMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        pendingBookings: statusCountMap.PENDING || 0,
        approvedBookings: statusCountMap.APPROVED || 0,
        paidBookings: statusCountMap.PAID || 0,
        refundedBookings: statusCountMap.REFUNDED || 0,
        rejectedBookings: statusCountMap.REJECTED || 0,
        totalRevenue: revenueAgg[0]?.totalRevenue || 0,
        revenueByDome
      }
    });
  } catch (error) {
    if (isDemoAuthEnabled()) {
      return res.status(200).json({
        success: true,
        data: getFallbackStats(),
        message: "Using demo dashboard stats because the database is unavailable."
      });
    }

    return res.status(500).json({
      success: false,
      message: getDatabaseErrorMessage(error)
    });
  }
};
