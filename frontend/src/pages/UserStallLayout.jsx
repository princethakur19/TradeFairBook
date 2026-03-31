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
import "../styles/userStallLayout.css";

const STALL_NUMBER_REGEX = /\d+/;
const MAX_PREVIEW_WIDTH = 880;
const MIN_STALL_SIZE = 24;

const sortByStallNumber = (a, b) => {
  const aNumber = Number.parseInt(a.stallNumber.match(STALL_NUMBER_REGEX)?.[0] || "0", 10);
  const bNumber = Number.parseInt(b.stallNumber.match(STALL_NUMBER_REGEX)?.[0] || "0", 10);
  return aNumber - bNumber;
};

const getRequiredPreviewWidth = (topCount, stallSize, topGap, sideGap, spacedCenterGap) => {
  const topSlots = Math.max(topCount, 1) + 2;
  const topWidth = topSlots * stallSize + (topSlots - 1) * topGap;
  const bodyWidth = stallSize * 4 + spacedCenterGap + sideGap * 2;
  return Math.max(topWidth, bodyWidth);
};

const StallBox = ({ stall, isSelected, onClick, extraClassName = "" }) => {
  const className = [
    "stall-box",
    stall.status.toLowerCase(),
    isSelected ? "selected" : "",
    extraClassName
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={() => onClick(stall)}
      title={`${stall.stallNumber} - INR ${stall.price} - ${stall.status}`}
    >
      <span>{stall.stallNumber}</span>
    </button>
  );
};

const StallPlaceholder = () => <div className="stall-box placeholder-slot" aria-hidden="true"></div>;

const UserStallLayout = () => {
  const { domeId } = useParams();
  const navigate = useNavigate();

  const [stalls, setStalls] = useState([]);
  const [domeData, setDomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStalls, setSelectedStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
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

  const centerSpacing = useMemo(() => {
    const centerStall = stalls.find((stall) => stall.side === "CENTER");
    return centerStall?.centerSpacing === "no-space" ? "no-space" : "with-space";
  }, [stalls]);

  const centerSpacingClass = centerSpacing === "with-space" ? "spaced" : "compact";

  const previewLayout = useMemo(() => {
    const leftColumn = grouped.LEFT.slice(1);
    const rightColumn = grouped.RIGHT.slice(1);
    const maxRows = Math.max(grouped.CENTER_LEFT.length, grouped.CENTER_RIGHT.length);
    const centerPairs = Array.from({ length: maxRows }, (_, index) => ({
      left: grouped.CENTER_LEFT[index] || null,
      right: grouped.CENTER_RIGHT[index] || null
    }));

    return {
      leftTop: grouped.LEFT[0] || null,
      rightTop: grouped.RIGHT[0] || null,
      leftColumn,
      rightColumn,
      centerPairs
    };
  }, [grouped.CENTER_LEFT, grouped.CENTER_RIGHT, grouped.LEFT, grouped.RIGHT]);

  const previewSizing = useMemo(() => {
    const topCount = Math.max(grouped.TOP.length, 1);

    let stallSize = 60;
    let topGap = 16;
    let sideGap = 40;
    let spacedCenterGap = 48;
    let compactCenterGap = 10;

    while (
      stallSize > MIN_STALL_SIZE
      && getRequiredPreviewWidth(topCount, stallSize, topGap, sideGap, spacedCenterGap) > MAX_PREVIEW_WIDTH
    ) {
      stallSize -= 1;

      if (stallSize <= 52) {
        topGap = 14;
        sideGap = 34;
        spacedCenterGap = 44;
        compactCenterGap = 10;
      }

      if (stallSize <= 46) {
        topGap = 12;
        sideGap = 28;
        spacedCenterGap = 38;
        compactCenterGap = 9;
      }

      if (stallSize <= 40) {
        topGap = 10;
        sideGap = 22;
        spacedCenterGap = 32;
        compactCenterGap = 8;
      }

      if (stallSize <= 34) {
        topGap = 8;
        sideGap = 18;
        spacedCenterGap = 26;
        compactCenterGap = 7;
      }

      if (stallSize <= 30) {
        topGap = 6;
        sideGap = 14;
        spacedCenterGap = 22;
        compactCenterGap = 6;
      }
    }

    return {
      stallSize,
      topGap,
      sideGap,
      spacedCenterGap,
      compactCenterGap
    };
  }, [grouped.TOP.length]);

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

  const handleStallClick = useCallback((stall) => {
    if (stall.status === "BOOKED" || stall.status === "BLOCKED") {
      setSelectedStall(stall);
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

            {selectedStalls.length > 0 && (
              <div className="selected-summary">
                <p><strong>Selected:</strong> {selectedStallNumbers}</p>
                <p><strong>Total:</strong> INR {totalSelectedAmount.toLocaleString()}</p>
              </div>
            )}

            <button className="select-btn" type="button" onClick={openBookingModal}>
              {selectedStalls.length
                ? `Book ${selectedStalls.length} Stall${selectedStalls.length > 1 ? "s" : ""}`
                : "Click on stalls to select"}
            </button>

            {selectedStalls.length > 0 && (
              <button className="select-btn clear-btn" type="button" onClick={() => setSelectedStalls([])}>
                Clear Selection
              </button>
            )}
          </div>

          <div className="right-panel">
            <h2 className="panel-title">Stall Layout Preview</h2>

            <div
              className="layout-preview"
              style={{
                "--map-stall-size": `${previewSizing.stallSize}px`,
                "--map-row-gap": `${previewSizing.topGap}px`,
                "--map-top-gap": `${previewSizing.topGap}px`,
                "--map-side-gap": `${previewSizing.sideGap}px`,
                "--map-center-gap-spaced": `${previewSizing.spacedCenterGap}px`,
                "--map-center-gap-compact": `${previewSizing.compactCenterGap}px`
              }}
            >
              <div className="user-map-structure">
                <div className="user-map-top-left">
                  {previewLayout.leftTop ? (
                    <StallBox
                      stall={previewLayout.leftTop}
                      isSelected={selectedStallIds.has(previewLayout.leftTop._id)}
                      onClick={handleStallClick}
                    />
                  ) : (
                    <StallPlaceholder />
                  )}
                </div>

                <div className="user-map-top-center">
                  {grouped.TOP.map((stall) => (
                    <StallBox
                      key={stall._id}
                      stall={stall}
                      isSelected={selectedStallIds.has(stall._id)}
                      onClick={handleStallClick}
                    />
                  ))}
                </div>

                <div className="user-map-top-right">
                  {previewLayout.rightTop ? (
                    <StallBox
                      stall={previewLayout.rightTop}
                      isSelected={selectedStallIds.has(previewLayout.rightTop._id)}
                      onClick={handleStallClick}
                    />
                  ) : (
                    <StallPlaceholder />
                  )}
                </div>

                <div className="user-left-column">
                  {previewLayout.leftColumn.map((stall) => (
                    <StallBox
                      key={stall._id}
                      stall={stall}
                      isSelected={selectedStallIds.has(stall._id)}
                      onClick={handleStallClick}
                    />
                  ))}
                </div>

                <div className="user-center-grid-shell">
                  <div className={`user-center-grid ${centerSpacingClass}`}>
                    {previewLayout.centerPairs.map((pair, index) => (
                      <React.Fragment key={pair.left?._id || pair.right?._id || `center-row-${index}`}>
                        {pair.left ? (
                          <StallBox
                            stall={pair.left}
                            isSelected={selectedStallIds.has(pair.left._id)}
                            onClick={handleStallClick}
                            extraClassName="center-stall"
                          />
                        ) : (
                          <StallPlaceholder />
                        )}

                        {pair.right ? (
                          <StallBox
                            stall={pair.right}
                            isSelected={selectedStallIds.has(pair.right._id)}
                            onClick={handleStallClick}
                            extraClassName="center-stall"
                          />
                        ) : (
                          <StallPlaceholder />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="user-right-column">
                  {previewLayout.rightColumn.map((stall) => (
                    <StallBox
                      key={stall._id}
                      stall={stall}
                      isSelected={selectedStallIds.has(stall._id)}
                      onClick={handleStallClick}
                    />
                  ))}
                </div>
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

      {selectedStall && (selectedStall.status === "BOOKED" || selectedStall.status === "BLOCKED") && (
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
