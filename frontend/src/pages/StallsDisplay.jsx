import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../api/axios";
import { getStallsByDome } from "../services/stallService";
import "../styles/stallsDisplay.css";

const StallsDisplay = () => {
  const { domeId } = useParams();
  const navigate = useNavigate();

  const [stalls, setStalls] = useState([]);
  const [domeData, setDomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSide, setFilterSide] = useState("ALL");
  const [selectedStall, setSelectedStall] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const fetchStalls = useCallback(async () => {
    try {
      setLoading(true);
      const [domeRes, stallsRes] = await Promise.all([
        api.get(`/domes/${domeId}`),
        getStallsByDome(domeId)
      ]);

      setDomeData(domeRes.data?.data || null);
      setStalls(stallsRes?.data || []);
    } catch (error) {
      console.error("Error fetching stalls:", error);
    } finally {
      setLoading(false);
    }
  }, [domeId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStalls();
  }, [fetchStalls]);

  const filteredStalls = useMemo(() => {
    if (filterSide === "ALL") return stalls;
    return stalls.filter((stall) => stall.side === filterSide);
  }, [filterSide, stalls]);

  const counts = useMemo(() => {
    const available = stalls.filter((stall) => stall.status === "AVAILABLE").length;
    const booked = stalls.filter((stall) => stall.status === "BOOKED").length;
    return { available, booked };
  }, [stalls]);

  const getStatusColor = (status) => {
    if (status === "AVAILABLE") return "#16a34a";
    if (status === "BOOKED") return "#dc2626";
    if (status === "HOLD") return "#f59e0b";
    if (status === "BLOCKED") return "#6b7280";
    return "#6b7280";
  };

  const handleBookStall = useCallback((stall) => {
    if (stall.status === "BOOKED" || stall.status === "BLOCKED") {
      alert(`This stall is ${stall.status.toLowerCase()} and cannot be booked.`);
      return;
    }

    setSelectedStall(stall);
    setShowBookingModal(true);
  }, []);

  const handleConfirmBooking = useCallback(async () => {
    if (!selectedStall) return;

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Please log in to book a stall.");
        return;
      }

      await api.post("/bookings", {
        user: userId,
        stall: selectedStall._id,
        dome: domeId,
        amount: selectedStall.price,
        status: "PENDING"
      });

      alert("Stall booked successfully!");
      setShowBookingModal(false);
      setSelectedStall(null);
      fetchStalls();
    } catch (error) {
      console.error("Error booking stall:", error);
      alert("Failed to book stall. Please try again.");
    }
  }, [domeId, fetchStalls, selectedStall]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="stalls-container">
          <div className="loading">Loading stalls...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="stalls-container">
        <section className="stalls-header">
          <div className="header-top">
            <button className="back-btn" onClick={() => navigate("/domes")}>
              Back to Domes
            </button>
            <button className="view-toggle-btn" onClick={() => navigate(`/select-stall/${domeId}`)}>
              Select Stall
            </button>
            <button className="view-toggle-btn" onClick={() => navigate(`/layout/${domeId}`)}>
              Layout View
            </button>
          </div>
          <h1>Available Stalls</h1>
          {domeData && (
            <>
              <h2 className="dome-name">{domeData.domeName || domeData.name}</h2>
              <p className="dome-description">{domeData.description}</p>
            </>
          )}
        </section>

        <section className="stalls-stats">
          <div className="stat-card">
            <div className="stat-value">{stalls.length}</div>
            <div className="stat-label">Total Stalls</div>
          </div>
          <div className="stat-card available">
            <div className="stat-value">{counts.available}</div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-card booked">
            <div className="stat-value">{counts.booked}</div>
            <div className="stat-label">Booked</div>
          </div>
        </section>

        <section className="stalls-filter">
          <h3>Filter by Side:</h3>
          <div className="filter-buttons">
            {["ALL", "TOP", "LEFT", "CENTER", "RIGHT"].map((side) => (
              <button
                key={side}
                className={`filter-btn ${filterSide === side ? "active" : ""}`}
                onClick={() => setFilterSide(side)}
              >
                {side === "ALL" ? "All Stalls" : side}
              </button>
            ))}
          </div>
        </section>

        <section className="stalls-grid">
          {filteredStalls.length > 0 ? (
            filteredStalls.map((stall) => (
              <div key={stall._id} className={`stall-card ${stall.status.toLowerCase()}`}>
                <div className="stall-header">
                  <h3 className="stall-number">{stall.stallNumber}</h3>
                  <span className="stall-status" style={{ backgroundColor: getStatusColor(stall.status) }}>
                    {stall.status || "AVAILABLE"}
                  </span>
                </div>

                <div className="stall-details">
                  <p><strong>Side:</strong> {stall.side}</p>
                  <p><strong>Price:</strong> INR {stall.price.toLocaleString()}</p>
                </div>

                {stall.status === "AVAILABLE" ? (
                  <button className="book-btn" onClick={() => handleBookStall(stall)}>
                    Book Now
                  </button>
                ) : (
                  <button className="book-btn disabled" disabled>
                    {stall.status === "BOOKED" ? "Already Booked" : "Unavailable"}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="no-stalls">
              <p>No stalls found in this dome.</p>
            </div>
          )}
        </section>
      </main>

      {showBookingModal && selectedStall && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Booking</h2>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>
                x
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-details">
                <p><strong>Stall Number:</strong> {selectedStall.stallNumber}</p>
                <p><strong>Side:</strong> {selectedStall.side}</p>
                <p><strong>Price:</strong> INR {selectedStall.price.toLocaleString()}</p>
                <p><strong>Dome:</strong> {domeData?.domeName || domeData?.name}</p>
              </div>

              <div className="booking-terms">
                <p>By confirming, you agree to the booking terms and conditions.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowBookingModal(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmBooking}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default StallsDisplay;
