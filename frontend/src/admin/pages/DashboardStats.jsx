import React, { useEffect, useState } from "react";
import { getAdminDashboardStats } from "../services/adminDashboardService";

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAdminDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-fluid-card manage-card">
      <div className="card-header-flex">
        <h2 className="card-title">Admin Dashboard</h2>
      </div>

      {loading ? <p className="empty-table-msg">Loading dashboard...</p> : null}
      {error ? <p className="manage-feedback manage-feedback-error">{error}</p> : null}

      {!loading && !error && stats ? (
        <>
          <div className="report-metrics-grid">
            <div className="report-metric-card">
              <span>Total Users</span>
              <strong>{stats.totalUsers || 0}</strong>
            </div>
            <div className="report-metric-card">
              <span>Total Bookings</span>
              <strong>{stats.totalBookings || 0}</strong>
            </div>
            <div className="report-metric-card">
              <span>Approved Bookings</span>
              <strong>{stats.approvedBookings || 0}</strong>
            </div>
            <div className="report-metric-card">
              <span>Paid Bookings</span>
              <strong>{stats.paidBookings || 0}</strong>
            </div>
            <div className="report-metric-card">
              <span>Refunded Bookings</span>
              <strong>{stats.refundedBookings || 0}</strong>
            </div>
            <div className="report-metric-card">
              <span>Pending Bookings</span>
              <strong>{stats.pendingBookings || 0}</strong>
            </div>
            <div className="report-metric-card">
              <span>Total Revenue</span>
              <strong className="metric-revenue">{formatInr(stats.totalRevenue)}</strong>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>DOME</th>
                  <th>REVENUE</th>
                </tr>
              </thead>
              <tbody>
                {(stats.revenueByDome || []).length ? (
                  stats.revenueByDome.map((row) => (
                    <tr key={row.domeName}>
                      <td>{row.domeName}</td>
                      <td>{formatInr(row.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="empty-table-msg">
                      No revenue data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default DashboardStats;
