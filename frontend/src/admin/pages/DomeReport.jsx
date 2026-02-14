import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const DomeReport = () => {
  const [domes, setDomes] = useState([]);
  const [selectedDomeId, setSelectedDomeId] = useState("");
  const [report, setReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch all domes
  useEffect(() => {
    const fetchDomes = async () => {
      try {
        const res = await api.get("/domes");

        setDomes(res.data.data);

        if (res.data.data.length > 0) {
        setSelectedDomeId(res.data.data[0]._id);
      }

      } catch (error) {
        console.error("Error fetching domes:", error);
      }
    };

    fetchDomes();
  }, []);

  // Fetch report when dome changes
  useEffect(() => {
    if (!selectedDomeId) return;

    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${selectedDomeId}`);
        setReport(res.data);
      } catch (error) {
        console.error("Error fetching report:", error);
      }
    };

    fetchReport();
  }, [selectedDomeId]);

  if (!report) {
    return <div>Loading report...</div>;
  }

  const filteredBookings =
    statusFilter === "ALL"
      ? report.bookings
      : report.bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="report-card">
      <h2 className="report-title">Dome Report</h2>

      {/* Select Dome */}
      <div className="input-group report-select-group">
        <label>Select Dome</label>
        <select
          value={selectedDomeId}
          onChange={(e) => setSelectedDomeId(e.target.value)}
        >
          {domes.map((dome) => (
            <option key={dome._id} value={dome._id}>
              {dome.domeName}
            </option>

          ))}
        </select>
      </div>

      {/* Metrics */}
      <div className="report-metrics-grid">
        <div className="report-metric-card">
          <span>Total Stalls</span>
          <strong>{report.totalStalls}</strong>
        </div>
        <div className="report-metric-card">
          <span>Booked Stalls</span>
          <strong>{report.bookedStalls}</strong>
        </div>
        <div className="report-metric-card">
          <span>Available Stalls</span>
          <strong>{report.availableStalls}</strong>
        </div>
        <div className="report-metric-card">
          <span>Total Revenue</span>
          <strong className="metric-revenue">
            {formatInr(report.totalRevenue)}
          </strong>
        </div>
      </div>

      {/* Filter */}
      <div className="report-filters-row">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Booking Table */}
      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Stall</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.user?.name || "N/A"}</td>
                  <td>{booking.stall?.stallNumber || "N/A"}</td>
                  <td>{booking.status}</td>
                  <td>{formatInr(booking.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DomeReport;
