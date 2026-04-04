import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

const AUTO_REFRESH_MS = 15000;
const STALL_NUMBER_REGEX = /\d+/;
const MAX_PREVIEW_WIDTH = 880;
const MIN_STALL_SIZE = 24;

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const formatLastUpdated = (value) => {
  if (!value) return "Never";

  const asDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(asDate.getTime())) return "Never";

  return asDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

const sortByStallNumber = (a, b) => {
  const aNumber = Number.parseInt(a.stallNumber?.match(STALL_NUMBER_REGEX)?.[0] || "0", 10);
  const bNumber = Number.parseInt(b.stallNumber?.match(STALL_NUMBER_REGEX)?.[0] || "0", 10);
  return aNumber - bNumber;
};

const getRequiredPreviewWidth = (topCount, stallSize, topGap, sideGap, spacedCenterGap) => {
  const topSlots = Math.max(topCount, 1) + 2;
  const topWidth = topSlots * stallSize + (topSlots - 1) * topGap;
  const bodyWidth = stallSize * 4 + spacedCenterGap + sideGap * 2;
  return Math.max(topWidth, bodyWidth);
};

const ManageStalls = () => {
  const [domes, setDomes] = useState([]);
  const [selectedDomeId, setSelectedDomeId] = useState("");
  const [stallsData, setStallsData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    price: "",
    status: "AVAILABLE"
  });
  const [isLoadingStalls, setIsLoadingStalls] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const fetchDomes = useCallback(async () => {
    try {
      const res = await api.get("/domes");
      setDomes(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Dome fetch error:", error);
      setDomes([]);
    }
  }, []);

  const fetchStalls = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoadingStalls(true);
      }

      const res = await api.get("/stalls");
      setStallsData(Array.isArray(res.data?.data) ? res.data.data : []);
      setLastUpdatedAt(new Date());
      setErrorMessage("");
    } catch (error) {
      console.error("Fetch error:", error);
      if (!silent) {
        setStallsData([]);
      }
      setErrorMessage("Unable to load stalls. Please refresh and try again.");
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsLoadingStalls(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDomes();
    fetchStalls();
  }, [fetchDomes, fetchStalls]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (editingId) return;
      fetchStalls({ silent: true });
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, [editingId, fetchStalls]);

  const filteredStalls = useMemo(
    () =>
      selectedDomeId
        ? stallsData.filter((stall) => String(stall.dome?._id || "") === selectedDomeId)
        : stallsData,
    [selectedDomeId, stallsData]
  );

  const selectedDomeName = useMemo(
    () => domes.find((dome) => dome._id === selectedDomeId)?.domeName || "",
    [domes, selectedDomeId]
  );

  const groupedLayout = useMemo(() => {
    if (!selectedDomeId) {
      return {
        top: [],
        left: [],
        right: [],
        centerLeft: [],
        centerRight: []
      };
    }

    const top = filteredStalls.filter((stall) => stall.side === "TOP").sort(sortByStallNumber);
    const left = filteredStalls.filter((stall) => stall.side === "LEFT").sort(sortByStallNumber);
    const right = filteredStalls.filter((stall) => stall.side === "RIGHT").sort(sortByStallNumber);
    const center = filteredStalls.filter((stall) => stall.side === "CENTER").sort(sortByStallNumber);

    return {
      top,
      left,
      right,
      centerLeft: center.filter((_, index) => index % 2 === 0),
      centerRight: center.filter((_, index) => index % 2 !== 0)
    };
  }, [filteredStalls, selectedDomeId]);

  const centerSpacingClass = useMemo(() => {
    const centerStall = filteredStalls.find((stall) => stall.side === "CENTER");
    return centerStall?.centerSpacing === "no-space" ? "compact" : "spaced";
  }, [filteredStalls]);

  const previewLayout = useMemo(() => {
    if (!selectedDomeId) {
      return {
        leftTop: null,
        rightTop: null,
        leftColumn: [],
        rightColumn: [],
        centerPairs: []
      };
    }

    const leftColumn = groupedLayout.left.slice(1);
    const rightColumn = groupedLayout.right.slice(1);
    const maxRows = Math.max(groupedLayout.centerLeft.length, groupedLayout.centerRight.length);
    const centerPairs = Array.from({ length: maxRows }, (_, index) => ({
      left: groupedLayout.centerLeft[index] || null,
      right: groupedLayout.centerRight[index] || null
    }));

    return {
      leftTop: groupedLayout.left[0] || null,
      rightTop: groupedLayout.right[0] || null,
      leftColumn,
      rightColumn,
      centerPairs
    };
  }, [
    groupedLayout.centerLeft,
    groupedLayout.centerRight,
    groupedLayout.left,
    groupedLayout.right,
    selectedDomeId
  ]);

  const previewSizing = useMemo(() => {
    const topCount = Math.max(groupedLayout.top.length, 1);

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
  }, [groupedLayout.top.length]);

  const layoutCounts = useMemo(() => {
    if (!selectedDomeId) {
      return {
        total: 0,
        available: 0,
        booked: 0,
        hold: 0,
        blocked: 0
      };
    }

    return {
      total: filteredStalls.length,
      available: filteredStalls.filter((stall) => stall.status === "AVAILABLE").length,
      booked: filteredStalls.filter((stall) => stall.status === "BOOKED").length,
      hold: filteredStalls.filter((stall) => stall.status === "HOLD").length,
      blocked: filteredStalls.filter((stall) => stall.status === "BLOCKED").length
    };
  }, [filteredStalls, selectedDomeId]);

  const startEdit = (stall) => {
    setEditingId(stall._id);
    setEditForm({
      price: stall.price,
      status: stall.status || "AVAILABLE"
    });
    setFeedbackMessage("");
    setErrorMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      const nextPrice = Number(editForm.price);
      if (!Number.isFinite(nextPrice) || nextPrice < 0) {
        setErrorMessage("Please enter a valid non-negative price.");
        return;
      }

      await api.put(`/stalls/${id}`, {
        price: nextPrice,
        status: editForm.status
      });

      setEditingId(null);
      setFeedbackMessage("Stall updated successfully.");
      setErrorMessage("");
      fetchStalls({ silent: true });
    } catch (error) {
      console.error("Update error:", error);
      setFeedbackMessage("");
      setErrorMessage(error.response?.data?.message || "Failed to update stall.");
    }
  };

  const deleteStall = async (id) => {
    if (!window.confirm("Delete this stall?")) return;

    try {
      await api.delete(`/stalls/${id}`);
      setFeedbackMessage("Stall deleted successfully.");
      setErrorMessage("");
      fetchStalls({ silent: true });
    } catch (error) {
      console.error("Delete error:", error);
      setFeedbackMessage("");
      setErrorMessage(error.response?.data?.message || "Failed to delete stall.");
    }
  };

  const renderStallBox = (stall, extraClassName = "") => {
    if (!stall) {
      return <div className="live-stall-box live-stall-placeholder" aria-hidden="true"></div>;
    }

    const statusClass = String(stall.status || "AVAILABLE").toLowerCase();
    const classes = ["live-stall-box", statusClass, extraClassName].filter(Boolean).join(" ");

    return (
      <div
        key={stall._id}
        className={classes}
        title={`${stall.stallNumber} - ${formatInr(stall.price)} - ${stall.status || "AVAILABLE"}`}
      >
        {stall.stallNumber}
      </div>
    );
  };

  return (
    <div className="admin-fluid-card manage-card">
      <div className="card-header-flex">
        <h2 className="card-title">Manage Stalls</h2>
        <span className="count-badge">{filteredStalls.length} Stalls</span>
      </div>

      <div className="manage-filter-row">
        <div className="input-group manage-dome-select">
          <label>Select Dome</label>
          <select value={selectedDomeId} onChange={(e) => setSelectedDomeId(e.target.value)}>
            <option value="">All Domes</option>
            {domes.map((dome) => (
              <option key={dome._id} value={dome._id}>
                {dome.domeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedbackMessage ? <p className="manage-feedback manage-feedback-success">{feedbackMessage}</p> : null}
      {errorMessage ? <p className="manage-feedback manage-feedback-error">{errorMessage}</p> : null}

      <section className="manage-layout-live-section">
        <div className="manage-layout-live-header">
          <div>
            <h3 className="manage-layout-live-title">Live Stall Layout</h3>
            <p className="manage-layout-live-subtitle">
              {selectedDomeId
                ? `${selectedDomeName || "Selected Dome"} - booked stalls are highlighted in red`
                : "Select a dome to view the live booked/available layout"}
            </p>
          </div>

          <div className="manage-layout-live-meta">
            <span className="count-badge">Updated: {formatLastUpdated(lastUpdatedAt)}</span>
            <button
              className="edit-icon-btn"
              onClick={() => fetchStalls({ silent: true })}
              disabled={isRefreshing || isLoadingStalls}
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {!selectedDomeId ? (
          <div className="live-layout-empty">Please choose a dome to open the live layout map.</div>
        ) : isLoadingStalls ? (
          <div className="live-layout-empty">Loading live layout...</div>
        ) : !filteredStalls.length ? (
          <div className="live-layout-empty">No stalls found for this dome.</div>
        ) : (
          <>
            <div className="manage-layout-stats-grid">
              <div className="manage-layout-stat-card">
                <span className="manage-layout-stat-label">Total</span>
                <strong className="manage-layout-stat-value">{layoutCounts.total}</strong>
              </div>
              <div className="manage-layout-stat-card available">
                <span className="manage-layout-stat-label">Available</span>
                <strong className="manage-layout-stat-value">{layoutCounts.available}</strong>
              </div>
              <div className="manage-layout-stat-card booked">
                <span className="manage-layout-stat-label">Booked</span>
                <strong className="manage-layout-stat-value">{layoutCounts.booked}</strong>
              </div>
              <div className="manage-layout-stat-card hold">
                <span className="manage-layout-stat-label">Hold</span>
                <strong className="manage-layout-stat-value">{layoutCounts.hold}</strong>
              </div>
              <div className="manage-layout-stat-card blocked">
                <span className="manage-layout-stat-label">Blocked</span>
                <strong className="manage-layout-stat-value">{layoutCounts.blocked}</strong>
              </div>
            </div>

            <div
              className="live-map-container"
              style={{
                "--live-stall-size": `${previewSizing.stallSize}px`,
                "--live-stall-gap": `${previewSizing.topGap}px`,
                "--live-map-top-gap": `${previewSizing.topGap}px`,
                "--live-map-side-gap": `${previewSizing.sideGap}px`,
                "--live-center-gap-spaced": `${previewSizing.spacedCenterGap}px`,
                "--live-center-gap-compact": `${previewSizing.compactCenterGap}px`
              }}
            >
              <div className="live-map-structure">
                <div className="live-map-top-left">{renderStallBox(previewLayout.leftTop)}</div>

                <div className="live-map-top-center">{groupedLayout.top.map((stall) => renderStallBox(stall))}</div>

                <div className="live-map-top-right">{renderStallBox(previewLayout.rightTop)}</div>

                <div className="live-left-column">
                  {previewLayout.leftColumn.map((stall) => renderStallBox(stall))}
                </div>

                <div className="live-center-grid-shell">
                  <div className={`live-center-grid ${centerSpacingClass}`}>
                    {previewLayout.centerPairs.map((pair, index) => (
                      <React.Fragment
                        key={pair.left?._id || pair.right?._id || `live-center-row-${index}`}
                      >
                        {renderStallBox(pair.left, "center-stall")}
                        {renderStallBox(pair.right, "center-stall")}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="live-right-column">
                  {previewLayout.rightColumn.map((stall) => renderStallBox(stall))}
                </div>
              </div>
            </div>

            <div className="live-layout-legend">
              <div className="legend-item">
                <span className="legend-color available"></span>
                Available
              </div>
              <div className="legend-item">
                <span className="legend-color booked"></span>
                Booked
              </div>
              <div className="legend-item">
                <span className="legend-color hold"></span>
                Hold
              </div>
              <div className="legend-item">
                <span className="legend-color blocked"></span>
                Blocked
              </div>
            </div>
          </>
        )}
      </section>

      <div className="table-responsive-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>STALL</th>
              <th>DOME</th>
              <th>SIDE</th>
              <th>PRICE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {isLoadingStalls ? (
              <tr>
                <td colSpan="6" className="empty-table-msg">
                  Loading stalls...
                </td>
              </tr>
            ) : (
              filteredStalls.map((stall) => (
                <tr key={stall._id}>
                  <td className="font-bold">{stall.stallNumber}</td>
                  <td>{stall.dome?.domeName || "N/A"}</td>
                  <td>{stall.side}</td>
                  <td>
                    {editingId === stall._id ? (
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: e.target.value
                          })
                        }
                        className="table-input"
                      />
                    ) : (
                      formatInr(stall.price)
                    )}
                  </td>
                  <td>
                    {editingId === stall._id ? (
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            status: e.target.value
                          })
                        }
                        className="table-select"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="BOOKED">BOOKED</option>
                        <option value="HOLD">HOLD</option>
                        <option value="BLOCKED">BLOCKED</option>
                      </select>
                    ) : (
                      <span className={`status-pill ${String(stall.status || "AVAILABLE").toLowerCase()}`}>
                        {stall.status || "AVAILABLE"}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {editingId === stall._id ? (
                        <>
                          <button className="edit-icon-btn save-btn" onClick={() => saveEdit(stall._id)}>
                            Save
                          </button>
                          <button className="edit-icon-btn cancel-btn" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="edit-icon-btn" onClick={() => startEdit(stall)}>
                            Edit
                          </button>
                          <button className="edit-icon-btn delete-btn" onClick={() => deleteStall(stall._id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!isLoadingStalls && !filteredStalls.length ? (
              <tr>
                <td colSpan="6" className="empty-table-msg">
                  No stalls found for the selected dome.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStalls;
