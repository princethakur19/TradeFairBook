import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BookingMaterialsSection from "../components/booking/BookingMaterialsSection";
import api from "../api/axios";
import { getActiveMaterialsByDome } from "../services/materialService";
import { getStallsByDome } from "../services/stallService";
import { getLoggedInUserId } from "../utils/auth";
import {
  DEFAULT_INCLUDED_MATERIALS,
  buildSelectedExtraMaterials,
  getExtraMaterialsTotal,
  getGrandTotal
} from "../utils/bookingMaterials";
import "../styles/stallsDisplay.css";

const StallsDisplay = () => {
  const { domeId } = useParams();
  const navigate = useNavigate();

  const [stalls, setStalls] = useState([]);
  const [domeData, setDomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSide, setFilterSide] = useState("ALL");
  const [selectedStalls, setSelectedStalls] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState("");
  const [materialQuantities, setMaterialQuantities] = useState({});

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

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setMaterialsLoading(true);
        setMaterialsError("");
        const materials = await getActiveMaterialsByDome(domeId);
        setAvailableMaterials(materials);
      } catch (error) {
        console.error("Error fetching materials:", error);
        setMaterialsError("Failed to load extra materials.");
        setAvailableMaterials([]);
      } finally {
        setMaterialsLoading(false);
      }
    };

    fetchMaterials();
  }, [domeId]);

  const filteredStalls = useMemo(() => {
    if (filterSide === "ALL") return stalls;
    return stalls.filter((stall) => stall.side === filterSide);
  }, [filterSide, stalls]);

  const counts = useMemo(() => {
    const available = stalls.filter((stall) => stall.status === "AVAILABLE").length;
    const booked = stalls.filter((stall) => stall.status === "BOOKED").length;
    return { available, booked };
  }, [stalls]);

  const selectedStallIds = useMemo(
    () => new Set(selectedStalls.map((stall) => stall._id)),
    [selectedStalls]
  );

  const totalSelectedAmount = useMemo(
    () => selectedStalls.reduce((sum, stall) => sum + Number(stall.price || 0), 0),
    [selectedStalls]
  );

  const selectedStallNumbers = useMemo(
    () => selectedStalls.map((stall) => stall.stallNumber).join(", "),
    [selectedStalls]
  );

  const selectedExtraMaterials = useMemo(
    () => buildSelectedExtraMaterials(availableMaterials, materialQuantities),
    [availableMaterials, materialQuantities]
  );

  const extraMaterialTotal = useMemo(
    () => getExtraMaterialsTotal(selectedExtraMaterials),
    [selectedExtraMaterials]
  );

  const grandTotal = useMemo(
    () => getGrandTotal(totalSelectedAmount, extraMaterialTotal),
    [extraMaterialTotal, totalSelectedAmount]
  );

  const handleQuantityChange = useCallback((materialId, nextValue) => {
    const parsed = Number.parseInt(nextValue, 10);
    const safeQuantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;

    setMaterialQuantities((prev) => ({
      ...prev,
      [materialId]: safeQuantity
    }));
  }, []);

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

    setSelectedStalls((prev) => {
      const exists = prev.some((selected) => selected._id === stall._id);
      if (exists) {
        return prev.filter((selected) => selected._id !== stall._id);
      }
      return [...prev, stall];
    });
  }, []);

  const openBookingModal = useCallback(() => {
    if (!selectedStalls.length) {
      alert("Please select at least one stall.");
      return;
    }
    setShowBookingModal(true);
  }, [selectedStalls.length]);

  const handleConfirmBooking = useCallback(async () => {
    if (!selectedStalls.length) return;

    const userId = getLoggedInUserId();
    if (!userId) {
      alert("Please log in to continue.");
      navigate("/login");
      return;
    }

    setShowBookingModal(false);
    navigate("/aadhar-upload", {
      state: {
        bookingContext: {
          domeId,
          amount: grandTotal,
          stallAmount: totalSelectedAmount,
          extraMaterialTotal,
          grandTotal,
          defaultMaterials: DEFAULT_INCLUDED_MATERIALS,
          extraMaterials: selectedExtraMaterials,
          stallNumber: selectedStallNumbers,
          stallIds: selectedStalls.map((stall) => stall._id),
          stalls: selectedStalls.map((stall) => ({
            _id: stall._id,
            stallNumber: stall.stallNumber,
            side: stall.side,
            price: stall.price
          }))
        }
      }
    });
  }, [
    domeId,
    extraMaterialTotal,
    grandTotal,
    navigate,
    selectedExtraMaterials,
    selectedStallNumbers,
    selectedStalls,
    totalSelectedAmount
  ]);

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
            <button className="back-btn header-action-btn" onClick={() => navigate("/domes")}>
              Back to Domes
            </button>
            <button className="view-toggle-btn header-action-btn" onClick={() => navigate(`/select-stall/${domeId}`)}>
              Select Stall
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

        <section className="selection-panel">
          <p>
            <strong>Selected:</strong>{" "}
            {selectedStalls.length ? `${selectedStalls.length} stall(s)` : "None"}
          </p>
          <p>
            <strong>Total:</strong> INR {totalSelectedAmount.toLocaleString()}
          </p>
          <div className="selection-actions">
            <button className="book-selected-btn" onClick={openBookingModal}>
              Book Selected
            </button>
            <button
              className="clear-selection-btn"
              onClick={() => setSelectedStalls([])}
              disabled={!selectedStalls.length}
            >
              Clear
            </button>
          </div>
        </section>

        <section className="stalls-grid">
          {filteredStalls.length > 0 ? (
            filteredStalls.map((stall) => (
              <div
                key={stall._id}
                className={`stall-card ${stall.status.toLowerCase()} ${selectedStallIds.has(stall._id) ? "selected" : ""}`}
              >
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
                    {selectedStallIds.has(stall._id) ? "Remove" : "Add to Selection"}
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

      {showBookingModal && selectedStalls.length > 0 && (
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
                <p><strong>Stalls:</strong> {selectedStallNumbers}</p>
                <p><strong>Count:</strong> {selectedStalls.length}</p>
                <p><strong>Stall Price:</strong> INR {totalSelectedAmount.toLocaleString()}</p>
                <p><strong>Extra Materials:</strong> INR {extraMaterialTotal.toLocaleString()}</p>
                <p><strong>Grand Total:</strong> INR {grandTotal.toLocaleString()}</p>
                <p><strong>Dome:</strong> {domeData?.domeName || domeData?.name}</p>
              </div>

              <BookingMaterialsSection
                includedMaterials={DEFAULT_INCLUDED_MATERIALS}
                availableMaterials={availableMaterials}
                materialQuantities={materialQuantities}
                onQuantityChange={handleQuantityChange}
                loading={materialsLoading}
                error={materialsError}
                extraMaterialTotal={extraMaterialTotal}
              />

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
