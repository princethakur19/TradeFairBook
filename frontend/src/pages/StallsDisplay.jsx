import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getStallsByDome } from "../services/stallService";
import axios from "axios";
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

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStalls();
  }, [domeId]);

  const fetchStalls = async () => {
    try {
      setLoading(true);
      // Fetch dome details
      const domeRes = await axios.get(`http://localhost:5000/api/domes/${domeId}`);
      setDomeData(domeRes.data.data);

      // Fetch stalls for this dome
      const stallsRes = await getStallsByDome(domeId);
      setStalls(stallsRes.data || []);
    } catch (error) {
      console.error("Error fetching stalls:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "AVAILABLE") return "#16a34a"; // green
    if (status === "BOOKED") return "#dc2626"; // red
    if (status === "HOLD") return "#f59e0b"; // amber
    if (status === "BLOCKED") return "#6b7280"; // gray
    return "#6b7280";
  };

  const getStatusLabel = (status) => {
    return status || "AVAILABLE";
  };

  const filteredStalls = 
    filterSide === "ALL" 
      ? stalls 
      : stalls.filter(stall => stall.side === filterSide);

  const availableCount = stalls.filter(s => s.status === "AVAILABLE").length;
  const bookedCount = stalls.filter(s => s.status === "BOOKED").length;

  const handleBookStall = (stall) => {
    if (stall.status === "BOOKED" || stall.status === "BLOCKED") {
      alert(`This stall is ${stall.status.toLowerCase()} and cannot be booked.`);
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
        fetchStalls(); // Refresh the stalls
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
        {/* Header Section */}
        <section className="stalls-header">
          <div className="header-top">
            <button className="back-btn" onClick={() => navigate("/domes")}>
              ← Back to Domes
            </button>
            <button className="view-toggle-btn" onClick={() => navigate(`/select-stall/${domeId}`)}>
              🎯 Select Stall
            </button>
            <button className="view-toggle-btn" onClick={() => navigate(`/layout/${domeId}`)}>
              📐 Layout View
            </button>
          </div>
          <h1>Available Stalls</h1>
          {domeData && (
            <>
              <h2 className="dome-name">{domeData.name}</h2>
              <p className="dome-description">{domeData.description}</p>
            </>
          )}
        </section>

        {/* Stats Section */}
        <section className="stalls-stats">
          <div className="stat-card">
            <div className="stat-value">{stalls.length}</div>
            <div className="stat-label">Total Stalls</div>
          </div>
          <div className="stat-card available">
            <div className="stat-value">{availableCount}</div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-card booked">
            <div className="stat-value">{bookedCount}</div>
            <div className="stat-label">Booked</div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="stalls-filter">
          <h3>Filter by Side:</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterSide === "ALL" ? "active" : ""}`}
              onClick={() => setFilterSide("ALL")}
            >
              All Stalls
            </button>
            <button 
              className={`filter-btn ${filterSide === "TOP" ? "active" : ""}`}
              onClick={() => setFilterSide("TOP")}
            >
              Top
            </button>
            <button 
              className={`filter-btn ${filterSide === "LEFT" ? "active" : ""}`}
              onClick={() => setFilterSide("LEFT")}
            >
              Left
            </button>
            <button 
              className={`filter-btn ${filterSide === "RIGHT" ? "active" : ""}`}
              onClick={() => setFilterSide("RIGHT")}
            >
              Right
            </button>
          </div>
        </section>

        {/* Stalls Grid */}
        <section className="stalls-grid">
          {filteredStalls.length > 0 ? (
            filteredStalls.map((stall) => (
              <div 
                key={stall._id} 
                className={`stall-card ${stall.status.toLowerCase()}`}
              >
                <div className="stall-header">
                  <h3 className="stall-number">{stall.stallNumber}</h3>
                  <span 
                    className="stall-status"
                    style={{ backgroundColor: getStatusColor(stall.status) }}
                  >
                    {getStatusLabel(stall.status)}
                  </span>
                </div>

                <div className="stall-details">
                  <p><strong>Side:</strong> {stall.side}</p>
                  <p><strong>Price:</strong> ₹{stall.price.toLocaleString()}</p>
                </div>

                {stall.status === "AVAILABLE" ? (
                  <button 
                    className="book-btn"
                    onClick={() => handleBookStall(stall)}
                  >
                    Book Now
                  </button>
                ) : (
                  <button 
                    className="book-btn disabled"
                    disabled
                  >
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

      <Footer />
    </>
  );
};

export default StallsDisplay;
