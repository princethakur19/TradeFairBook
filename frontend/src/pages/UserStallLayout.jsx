import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getStallsByDome } from "../services/stallService";
import axios from "axios";
import "../styles/userStallLayout.css";

const UserStallLayout = () => {
  const { domeId } = useParams();
  const navigate = useNavigate();

  const [stalls, setStalls] = useState([]);
  const [domeData, setDomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStall, setSelectedStall] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStalls();
  }, [domeId]);

  const fetchStalls = async () => {
    try {
      setLoading(true);
      const domeRes = await axios.get(`http://localhost:5000/api/domes/${domeId}`);
      setDomeData(domeRes.data.data);

      const stallsRes = await getStallsByDome(domeId);
      setStalls(stallsRes.data || []);
    } catch (error) {
      console.error("Error fetching stalls:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupStallsBySide = () => {
    const grouped = {
      TOP: stalls.filter(s => s.side === "TOP").sort((a, b) => 
        parseInt(a.stallNumber.slice(1)) - parseInt(b.stallNumber.slice(1))
      ),
      LEFT: stalls.filter(s => s.side === "LEFT").sort((a, b) => 
        parseInt(a.stallNumber.slice(1)) - parseInt(b.stallNumber.slice(1))
      ),
      RIGHT: stalls.filter(s => s.side === "RIGHT").sort((a, b) => 
        parseInt(a.stallNumber.slice(1)) - parseInt(b.stallNumber.slice(1))
      ),
    };
    return grouped;
  };

  const getStallCount = (side) => {
    return stalls.filter(s => s.side === side).length;
  };

  const getAvailableCount = (side) => {
    return stalls.filter(s => s.side === side && s.status === "AVAILABLE").length;
  };

  const getTotalAvailable = () => {
    return stalls.filter(s => s.status === "AVAILABLE").length;
  };

  const handleStallClick = (stall) => {
    if (stall.status === "BOOKED" || stall.status === "BLOCKED") {
      setSelectedStall(stall);
      return;
    }
    setSelectedStall(stall);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedStall) return;

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("Please log in to book a stall.");
        navigate("/login");
        return;
      }

      const bookingData = {
        user: userId,
        stall: selectedStall._id,
        dome: domeId,
        amount: selectedStall.price,
        status: "PENDING"
      };

      const response = await axios.post(
        "http://localhost:5000/api/bookings",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        alert("Stall booked successfully!");
        setShowBookingModal(false);
        setSelectedStall(null);
        fetchStalls();
      }
    } catch (error) {
      console.error("Error booking stall:", error);
      alert("Failed to book stall. Please try again.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="user-layout-wrapper">
          <div className="loading">Loading stall layout...</div>
        </div>
        <Footer />
      </>
    );
  }

  const grouped = groupStallsBySide();

  return (
    <>
      <Navbar />
      <main className="user-layout-wrapper">
        <section className="layout-header">
          <button className="back-btn" onClick={() => navigate("/domes")}>
            ← Back to Domes
          </button>
          <h1>Select Your Stall</h1>
          {domeData && <h2 className="dome-name">{domeData.name}</h2>}
        </section>

        <div className="layout-container">
          {/* LEFT PANEL - Stall Information */}
          <div className="left-panel">
            <h2 className="panel-title">Stall Layout Information</h2>

            <div className="dome-selector">
              <label>SELECTED DOME</label>
              <div className="dome-display">
                {domeData?.name || "Select Dome"}
              </div>
            </div>

            {/* Stall Counts */}
            <div className="stall-counts">
              <div className="count-row">
                <div className="count-item">
                  <span className="count-label">TOP ROW STALLS</span>
                  <span className="count-value">{getStallCount("TOP")}</span>
                  <span className="count-available">✓ {getAvailableCount("TOP")} available</span>
                </div>
                <div className="count-item">
                  <span className="count-label">CENTER ROWS (QTY)</span>
                  <span className="count-value">-</span>
                  <span className="count-available">View layout</span>
                </div>
              </div>

              <div className="count-row">
                <div className="count-item">
                  <span className="count-label">LEFT COLUMN STALLS</span>
                  <span className="count-value">{getStallCount("LEFT")}</span>
                  <span className="count-available">✓ {getAvailableCount("LEFT")} available</span>
                </div>
                <div className="count-item">
                  <span className="count-label">RIGHT COLUMN STALLS</span>
                  <span className="count-value">{getStallCount("RIGHT")}</span>
                  <span className="count-available">✓ {getAvailableCount("RIGHT")} available</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="statistics">
              <div className="stat">
                <span className="stat-label">Total Stalls</span>
                <span className="stat-value">{stalls.length}</span>
              </div>
              <div className="stat available">
                <span className="stat-label">Available</span>
                <span className="stat-value">{getTotalAvailable()}</span>
              </div>
              <div className="stat booked">
                <span className="stat-label">Booked</span>
                <span className="stat-value">{stalls.filter(s => s.status === "BOOKED").length}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button className="select-btn">
              Click on Stalls to Book →
            </button>
          </div>

          {/* RIGHT PANEL - Stall Layout Preview */}
          <div className="right-panel">
            <h2 className="panel-title">Stall Layout Preview</h2>

            <div className="layout-preview">
              {/* LEFT COLUMN */}
              <div className="preview-left">
                {grouped.LEFT.map((stall) => (
                  <div
                    key={stall._id}
                    className={`stall-box ${stall.status.toLowerCase()}`}
                    onClick={() => handleStallClick(stall)}
                    title={`${stall.stallNumber} - ₹${stall.price} - ${stall.status}`}
                  >
                    <span>{stall.stallNumber}</span>
                  </div>
                ))}
              </div>

              {/* CENTER AREA */}
              <div className="preview-center">
                {/* TOP ROW */}
                <div className="preview-top">
                  {grouped.TOP.map((stall) => (
                    <div
                      key={stall._id}
                      className={`stall-box ${stall.status.toLowerCase()}`}
                      onClick={() => handleStallClick(stall)}
                      title={`${stall.stallNumber} - ₹${stall.price} - ${stall.status}`}
                    >
                      <span>{stall.stallNumber}</span>
                    </div>
                  ))}
                </div>

                {/* CENTER SPACE */}
                <div className="preview-center-space">
                  <p>Exhibition Space</p>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="preview-right">
                {grouped.RIGHT.map((stall) => (
                  <div
                    key={stall._id}
                    className={`stall-box ${stall.status.toLowerCase()}`}
                    onClick={() => handleStallClick(stall)}
                    title={`${stall.stallNumber} - ₹${stall.price} - ${stall.status}`}
                  >
                    <span>{stall.stallNumber}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="layout-legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-color booked"></div>
                <span>Booked</span>
              </div>
              <div className="legend-item">
                <div className="legend-color hold"></div>
                <span>On Hold</span>
              </div>
              <div className="legend-item">
                <div className="legend-color blocked"></div>
                <span>Blocked</span>
              </div>
            </div>

            {/* Exit Entry */}
            <div className="exit-entry">
              <span className="exit">EXIT ↓</span>
              <span className="entry">^ ENTRY</span>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedStall && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Booking</h2>
              <button 
                className="close-btn"
                onClick={() => setShowBookingModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-details">
                <p><strong>Stall Number:</strong> {selectedStall.stallNumber}</p>
                <p><strong>Side:</strong> {selectedStall.side}</p>
                <p><strong>Price:</strong> ₹{selectedStall.price.toLocaleString()}</p>
                <p><strong>Dome:</strong> {domeData?.name}</p>
              </div>

              <div className="booking-terms">
                <p>By confirming, you agree to the booking terms and conditions.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={handleConfirmBooking}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stall Info Modal for Booked/Blocked */}
      {selectedStall && !showBookingModal && (selectedStall.status === "BOOKED" || selectedStall.status === "BLOCKED") && (
        <div className="modal-overlay" onClick={() => setSelectedStall(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Stall Information</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedStall(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-details">
                <p><strong>Stall Number:</strong> {selectedStall.stallNumber}</p>
                <p><strong>Side:</strong> {selectedStall.side}</p>
                <p><strong>Price:</strong> ₹{selectedStall.price.toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedStall.status}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setSelectedStall(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default UserStallLayout;
