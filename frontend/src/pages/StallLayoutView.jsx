import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getStallsByDome } from "../services/stallService";
import axios from "axios";
import "../styles/stallLayoutView.css";

const StallLayoutView = () => {
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
        <div className="c-shape-container">
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
      <main className="c-shape-container">
        <section className="c-header">
          <button className="back-btn" onClick={() => navigate(`/stalls/${domeId}`)}>
            ← Back to List View
          </button>
          <h1>Stall Layout</h1>
          {domeData && <h2 className="dome-title">{domeData.name}</h2>}
          <p className="subtitle">Arranged in C-Shape</p>
        </section>

        <div className="c-shape-layout">
          {/* LEFT COLUMN */}
          <div className="c-left-column">
            {grouped.LEFT.map((stall) => (
              <div
                key={stall._id}
                className={`stall-card c-card ${stall.status.toLowerCase()}`}
              >
                <div className="card-header">
                  <h3 className="stall-number">{stall.stallNumber}</h3>
                  <span className={`status-badge ${stall.status.toLowerCase()}`}>
                    {stall.status}
                  </span>
                </div>
                <div className="card-body">
                  <p><strong>Side:</strong> {stall.side}</p>
                  <p><strong>Price:</strong> ₹{stall.price.toLocaleString()}</p>
                </div>
                <button 
                  className={`book-btn ${stall.status !== "AVAILABLE" ? "disabled" : ""}`}
                  disabled={stall.status !== "AVAILABLE"}
                  onClick={() => handleStallClick(stall)}
                >
                  {stall.status === "AVAILABLE" ? "Book Now" : stall.status === "BOOKED" ? "Already Booked" : "Unavailable"}
                </button>
              </div>
            ))}
          </div>

          {/* TOP + CENTER */}
          <div className="c-center-area">
            {/* TOP ROW */}
            <div className="c-top-row">
              {grouped.TOP.map((stall) => (
                <div
                  key={stall._id}
                  className={`stall-card c-card ${stall.status.toLowerCase()}`}
                >
                  <div className="card-header">
                    <h3 className="stall-number">{stall.stallNumber}</h3>
                    <span className={`status-badge ${stall.status.toLowerCase()}`}>
                      {stall.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>Side:</strong> {stall.side}</p>
                    <p><strong>Price:</strong> ₹{stall.price.toLocaleString()}</p>
                  </div>
                  <button 
                    className={`book-btn ${stall.status !== "AVAILABLE" ? "disabled" : ""}`}
                    disabled={stall.status !== "AVAILABLE"}
                    onClick={() => handleStallClick(stall)}
                  >
                    {stall.status === "AVAILABLE" ? "Book Now" : stall.status === "BOOKED" ? "Already Booked" : "Unavailable"}
                  </button>
                </div>
              ))}
            </div>

            {/* CENTER SPACE */}
            <div className="c-center-space">
              <div className="center-content">
                <p>Exhibition Space</p>
                <span className="center-label">{domeData?.description || "Trade Fair"}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="c-right-column">
            {grouped.RIGHT.map((stall) => (
              <div
                key={stall._id}
                className={`stall-card c-card ${stall.status.toLowerCase()}`}
              >
                <div className="card-header">
                  <h3 className="stall-number">{stall.stallNumber}</h3>
                  <span className={`status-badge ${stall.status.toLowerCase()}`}>
                    {stall.status}
                  </span>
                </div>
                <div className="card-body">
                  <p><strong>Side:</strong> {stall.side}</p>
                  <p><strong>Price:</strong> ₹{stall.price.toLocaleString()}</p>
                </div>
                <button 
                  className={`book-btn ${stall.status !== "AVAILABLE" ? "disabled" : ""}`}
                  disabled={stall.status !== "AVAILABLE"}
                  onClick={() => handleStallClick(stall)}
                >
                  {stall.status === "AVAILABLE" ? "Book Now" : stall.status === "BOOKED" ? "Already Booked" : "Unavailable"}
                </button>
              </div>
            ))}
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
                <p><strong>Status:</strong> <span className={`status-badge ${selectedStall.status.toLowerCase()}`}>{selectedStall.status}</span></p>
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

export default StallLayoutView;
