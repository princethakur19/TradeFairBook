import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const getBookingStatusLabel = (status) => {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "APPROVED") return "Payment Pending";
  if (normalizedStatus === "PAID") return "Payment Confirmed";

  return normalizedStatus || "N/A";
};

const DomeReport = () => {
  const [domes, setDomes] = useState([]);
  const [selectedDomeId, setSelectedDomeId] = useState("");
  const [report, setReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all domes
  useEffect(() => {
    const fetchDomes = async () => {
      try {
        const res = await api.get("/domes");

        const loadedDomes = Array.isArray(res.data?.data) ? res.data.data : [];
        setDomes(loadedDomes);

        if (loadedDomes.length > 0) setSelectedDomeId(loadedDomes[0]._id);
        else setLoading(false);

      } catch (error) {
        console.error("Error fetching domes:", error);
        setErrorMessage(error.response?.data?.message || "Unable to load domes.");
        setLoading(false);
      }
    };

    fetchDomes();
  }, []);

  // Fetch report when dome changes
  useEffect(() => {
    if (!selectedDomeId) return undefined;
    let isMounted = true;

    const fetchReport = async () => {
      setLoading(true);
      setErrorMessage("");
      setReport(null);
      try {
        const res = await api.get(`/reports/${selectedDomeId}`);
        if (isMounted) setReport(res.data);
      } catch (error) {
        console.error("Error fetching report:", error);
        if (isMounted) {
          setReport(null);
          setErrorMessage(error.response?.data?.message || "Unable to load the dome report.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReport();
    return () => { isMounted = false; };
  }, [selectedDomeId]);

  if (loading && !report) {
    return <div className="report-card"><LoadingSpinner label="Loading report..." /></div>;
  }

  if (!report) {
    return (
      <div className="report-card">
        <h2 className="report-title">Dome Report</h2>
        <p className="manage-feedback manage-feedback-error">{errorMessage || "No dome data is available."}</p>
      </div>
    );
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
          <span>Payment Pending</span>
          <strong>{report.paymentPendingCount || 0}</strong>
        </div>
        <div className="report-metric-card">
          <span>Payment Confirmed</span>
          <strong>{report.paymentConfirmedCount || 0}</strong>
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
          <option value="APPROVED">Payment Pending</option>
          <option value="PAID">Payment Confirmed</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
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
                  <td>{booking.user?.fullname || booking.user?.name || "N/A"}</td>
                  <td>{booking.stall?.stallNumber || "N/A"}</td>
                  <td>{getBookingStatusLabel(booking.status)}</td>
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
