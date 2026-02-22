import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../api/axios";
import { getStallsByDome } from "../services/stallService";
import { getLoggedInUserId } from "../utils/auth";
import "../styles/userStallLayout.css";

const STALL_NUMBER_REGEX = /\d+/;

const sortByStallNumber = (a, b) => {
  const aNumber = Number.parseInt(a.stallNumber.match(STALL_NUMBER_REGEX)?.[0] || "0", 10);
  const bNumber = Number.parseInt(b.stallNumber.match(STALL_NUMBER_REGEX)?.[0] || "0", 10);
  return aNumber - bNumber;
};

const UserStallLayout = () => {
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

  const counts = useMemo(() => {
    const getBySide = (side) => stalls.filter((stall) => stall.side === side);
    const getAvailable = (side) => getBySide(side).filter((stall) => stall.status === "AVAILABLE").length;

    const totalAvailable = stalls.filter((stall) => stall.status === "AVAILABLE").length;
    const totalBooked = stalls.filter((stall) => stall.status === "BOOKED").length;
    const centerRows = Math.ceil((grouped.CENTER_LEFT.length + grouped.CENTER_RIGHT.length) / 2);

    return {
      top: getBySide("TOP").length,
      left: getBySide("LEFT").length,
      right: getBySide("RIGHT").length,
      centerRows,
      topAvailable: getAvailable("TOP"),
      leftAvailable: getAvailable("LEFT"),
      rightAvailable: getAvailable("RIGHT"),
      centerAvailable: getAvailable("CENTER"),
      total: stalls.length,
      totalAvailable,
      totalBooked
    };
  }, [grouped.CENTER_LEFT.length, grouped.CENTER_RIGHT.length, stalls]);

  const handleStallClick = useCallback((stall) => {
    if (stall.status === "BOOKED" || stall.status === "BLOCKED") {
      setSelectedStall(stall);
      setShowBookingModal(false);
      return;
    }

    setSelectedStall(stall);
    setShowBookingModal(true);
  }, []);

  const handleConfirmBooking = useCallback(async () => {
    if (!selectedStall) return;

    const userId = getLoggedInUserId();
    if (!userId) {
      alert("Please log in to continue.");
      navigate("/login");
      return;
    }

    setShowBookingModal(false);
    navigate(`/aadhar-upload/${selectedStall._id}`, {
      state: {
        bookingContext: {
          domeId,
          amount: selectedStall.price,
          stallNumber: selectedStall.stallNumber
        }
      }
    });
  }, [domeId, navigate, selectedStall]);

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

  return (
    <>
      <Navbar />
      <main className="user-layout-wrapper">
        <section className="layout-header">
          <button className="back-btn" onClick={() => navigate("/domes")}>
            Back to Domes
          </button>
          <h1>Select Your Stall</h1>
          {domeData && <h2 className="dome-name">{domeData.domeName || domeData.name}</h2>}
        </section>

        <div className="layout-container">
          <div className="left-panel">
            <h2 className="panel-title">Stall Layout Information</h2>

            <div className="dome-selector">
              <label>Selected Dome</label>
              <div className="dome-display">{domeData?.domeName || domeData?.name || "Select Dome"}</div>
            </div>

            <div className="stall-counts">
              <div className="count-row">
                <div className="count-item">
                  <span className="count-label">Top Row Stalls</span>
                  <span className="count-value">{counts.top}</span>
                  <span className="count-available">{counts.topAvailable} available</span>
                </div>
                <div className="count-item">
                  <span className="count-label">Center Rows</span>
                  <span className="count-value">{counts.centerRows}</span>
                  <span className="count-available">{counts.centerAvailable} available</span>
                </div>
              </div>

              <div className="count-row">
                <div className="count-item">
                  <span className="count-label">Left Column Stalls</span>
                  <span className="count-value">{counts.left}</span>
                  <span className="count-available">{counts.leftAvailable} available</span>
                </div>
                <div className="count-item">
                  <span className="count-label">Right Column Stalls</span>
                  <span className="count-value">{counts.right}</span>
                  <span className="count-available">{counts.rightAvailable} available</span>
                </div>
              </div>
            </div>

            <div className="statistics">
              <div className="stat">
                <span className="stat-label">Total Stalls</span>
                <span className="stat-value">{counts.total}</span>
              </div>
              <div className="stat available">
                <span className="stat-label">Available</span>
                <span className="stat-value">{counts.totalAvailable}</span>
              </div>
              <div className="stat booked">
                <span className="stat-label">Booked</span>
                <span className="stat-value">{counts.totalBooked}</span>
              </div>
            </div>

            <button className="select-btn" type="button">
              Click on stalls to book
            </button>
          </div>

          <div className="right-panel">
            <h2 className="panel-title">Stall Layout Preview</h2>

            <div className="layout-preview">
              <div className="preview-left">
                {grouped.LEFT.map((stall) => (
                  <button
                    key={stall._id}
                    type="button"
                    className={`stall-box ${stall.status.toLowerCase()}`}
                    onClick={() => handleStallClick(stall)}
                    title={`${stall.stallNumber} - INR ${stall.price} - ${stall.status}`}
                  >
                    <span>{stall.stallNumber}</span>
                  </button>
                ))}
              </div>

              <div className="preview-center">
                <div className="preview-top">
                  {grouped.TOP.map((stall) => (
                    <button
                      key={stall._id}
                      type="button"
                      className={`stall-box ${stall.status.toLowerCase()}`}
                      onClick={() => handleStallClick(stall)}
                      title={`${stall.stallNumber} - INR ${stall.price} - ${stall.status}`}
                    >
                      <span>{stall.stallNumber}</span>
                    </button>
                  ))}
                </div>

                <div className="preview-center-space">
                  <div className="preview-center-title">
                    <p>Exhibition Space</p>
                  </div>
                  <div className="preview-center-stalls">
                    <div className="preview-center-lane">
                      {grouped.CENTER_LEFT.map((stall) => (
                        <button
                          key={stall._id}
                          type="button"
                          className={`stall-box center-stall ${stall.status.toLowerCase()}`}
                          onClick={() => handleStallClick(stall)}
                          title={`${stall.stallNumber} - INR ${stall.price} - ${stall.status}`}
                        >
                          <span>{stall.stallNumber}</span>
                        </button>
                      ))}
                    </div>
                    <div className="preview-center-lane">
                      {grouped.CENTER_RIGHT.map((stall) => (
                        <button
                          key={stall._id}
                          type="button"
                          className={`stall-box center-stall ${stall.status.toLowerCase()}`}
                          onClick={() => handleStallClick(stall)}
                          title={`${stall.stallNumber} - INR ${stall.price} - ${stall.status}`}
                        >
                          <span>{stall.stallNumber}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="preview-right">
                {grouped.RIGHT.map((stall) => (
                  <button
                    key={stall._id}
                    type="button"
                    className={`stall-box ${stall.status.toLowerCase()}`}
                    onClick={() => handleStallClick(stall)}
                    title={`${stall.stallNumber} - INR ${stall.price} - ${stall.status}`}
                  >
                    <span>{stall.stallNumber}</span>
                  </button>
                ))}
              </div>
            </div>

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

            <div className="exit-entry">
              <span className="exit">Exit</span>
              <span className="entry">Entry</span>
            </div>
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
                <p><strong>Status:</strong> {selectedStall.status}</p>
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

export default UserStallLayout;
