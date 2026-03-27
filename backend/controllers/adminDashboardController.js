const Booking = require("../models/Booking");
const User = require("../models/User");

const REVENUE_BOOKING_STATUSES = ["PAID"];

exports.getDashboardStats = async (_req, res) => {
  try {
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
        rejectedBookings: statusCountMap.REJECTED || 0,
        totalRevenue: revenueAgg[0]?.totalRevenue || 0,
        revenueByDome
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
