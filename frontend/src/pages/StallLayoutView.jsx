import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../api/axios";
import { getStallsByDome } from "../services/stallService";
import "../styles/stallLayoutView.css";

const STALL_NUMBER_REGEX = /\d+/;

const sortByStallNumber = (a, b) => {
  const aNumber = Number.parseInt(a.stallNumber.match(STALL_NUMBER_REGEX)?.[0] || "0", 10);
  const bNumber = Number.parseInt(b.stallNumber.match(STALL_NUMBER_REGEX)?.[0] || "0", 10);
  return aNumber - bNumber;
};

const StallLayoutView = () => {
  const { domeId } = useParams();
  const navigate = useNavigate();

  const [stalls, setStalls] = useState([]);
  const [domeData, setDomeData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const grouped = useMemo(() => {
    const top = stalls.filter((stall) => stall.side === "TOP").sort(sortByStallNumber);
    const left = stalls.filter((stall) => stall.side === "LEFT").sort(sortByStallNumber);
    const right = stalls.filter((stall) => stall.side === "RIGHT").sort(sortByStallNumber);
    const center = stalls.filter((stall) => stall.side === "CENTER").sort(sortByStallNumber);

    return {
      TOP: top,
      LEFT: left,
      RIGHT: right,
      CENTER_LEFT: center.filter((_, index) => index % 2 === 0),
      CENTER_RIGHT: center.filter((_, index) => index % 2 !== 0)
    };
  }, [stalls]);

  const metrics = useMemo(() => {
    const available = stalls.filter((stall) => stall.status === "AVAILABLE").length;
    const booked = stalls.filter((stall) => stall.status === "BOOKED").length;
    const center = stalls.filter((stall) => stall.side === "CENTER").length;
    return {
      total: stalls.length,
      available,
      booked,
      center
    };
  }, [stalls]);

  const handleStallClick = useCallback((stall) => {
    if (stall.status === "BOOKED" || stall.status === "BLOCKED") {
      setSelectedStall(stall);
      setShowBookingModal(false);
      return;
    }

    setSelectedStall(stall);
    setShowBookingModal(true);
  }, []);

  const renderStallCard = (stall) => {
    const isAvailable = stall.status === "AVAILABLE";
    const isSelected = selectedStall?._id === stall._id;

    return (
      <div
        key={stall._id}
        className={`stall-card c-card ${stall.status.toLowerCase()} ${isSelected ? "selected" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => handleStallClick(stall)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleStallClick(stall);
          }
        }}
      >
        <div className="card-header">
          <h3 className="stall-number">{stall.stallNumber}</h3>
          <span className={`status-badge ${stall.status.toLowerCase()}`}>{stall.status}</span>
        </div>
        <div className="card-body">
          <p><strong>Side:</strong> {stall.side}</p>
          <p><strong>Price:</strong> INR {stall.price.toLocaleString()}</p>
        </div>
        <button
          className={`book-btn ${!isAvailable ? "disabled" : ""}`}
          disabled={!isAvailable}
          onClick={(event) => {
            event.stopPropagation();
            if (isAvailable) handleStallClick(stall);
          }}
        >
          {isAvailable ? "Book Now" : stall.status === "BOOKED" ? "Already Booked" : "Unavailable"}
        </button>
      </div>
    );
  };

  const handleConfirmBooking = useCallback(async () => {
    if (!selectedStall) return;

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Please log in to book a stall.");
        navigate("/login");
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
  }, [domeId, fetchStalls, navigate, selectedStall]);

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

  return (
    <>
      <Navbar />
      <main className="c-shape-container">
        <section className="c-header">
          <button className="back-btn" onClick={() => navigate(`/stalls/${domeId}`)}>
            Back to List View
          </button>
          <h1>Stall Layout</h1>
          {domeData && <h2 className="dome-title">{domeData.domeName || domeData.name}</h2>}
          <p className="subtitle">Arranged in C-Shape</p>
        </section>

        <section className="layout-metrics">
          <div className="layout-metric-card">
            <span>Total</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="layout-metric-card available">
            <span>Available</span>
            <strong>{metrics.available}</strong>
          </div>
          <div className="layout-metric-card booked">
            <span>Booked</span>
            <strong>{metrics.booked}</strong>
          </div>
          <div className="layout-metric-card">
            <span>Center Stalls</span>
            <strong>{metrics.center}</strong>
          </div>
        </section>

        <div className="c-shape-layout">
          <div className="c-left-column">
            {grouped.LEFT.map((stall) => renderStallCard(stall))}
          </div>

          <div className="c-center-area">
            <div className="c-top-row">
              {grouped.TOP.map((stall) => renderStallCard(stall))}
            </div>

            <div className="c-center-space">
              <div className="center-content">
                <p>Exhibition Space</p>
                <span className="center-label">{domeData?.description || "Trade Fair"}</span>
              </div>

              {(grouped.CENTER_LEFT.length > 0 || grouped.CENTER_RIGHT.length > 0) && (
                <div className="c-center-stalls">
                  <div className="c-center-lane">
                    {grouped.CENTER_LEFT.map((stall) => (
                      <button
                        key={stall._id}
                        type="button"
                        className={`center-stall-box ${stall.status.toLowerCase()}`}
                        onClick={() => handleStallClick(stall)}
                      >
                        {stall.stallNumber}
                      </button>
                    ))}
                  </div>
                  <div className="c-center-lane">
                    {grouped.CENTER_RIGHT.map((stall) => (
                      <button
                        key={stall._id}
                        type="button"
                        className={`center-stall-box ${stall.status.toLowerCase()}`}
                        onClick={() => handleStallClick(stall)}
                      >
                        {stall.stallNumber}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="c-right-column">
            {grouped.RIGHT.map((stall) => renderStallCard(stall))}
          </div>
        </div>
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

      {selectedStall && !showBookingModal && (selectedStall.status === "BOOKED" || selectedStall.status === "BLOCKED") && (
        <div className="modal-overlay" onClick={() => setSelectedStall(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Stall Information</h2>
              <button className="close-btn" onClick={() => setSelectedStall(null)}>
                x
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-details">
                <p><strong>Stall Number:</strong> {selectedStall.stallNumber}</p>
                <p><strong>Side:</strong> {selectedStall.side}</p>
                <p><strong>Price:</strong> INR {selectedStall.price.toLocaleString()}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge ${selectedStall.status.toLowerCase()}`}>{selectedStall.status}</span>
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setSelectedStall(null)}>
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
