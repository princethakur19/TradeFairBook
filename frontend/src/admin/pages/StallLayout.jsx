import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getAllDomes } from "../services/adminDomeServices";
import { generateStallArray, saveStallsToDB } from "../services/adminStallService";

const MIN_COUNTS = {
  top: 1,
  center: 0,
  left: 1,
  right: 1,
};

const INITIAL_CONFIG = {
  top: 5,
  center: 4,
  left: 7,
  right: 7,
};

const MAX_PREVIEW_WIDTH = 880;
const MIN_STALL_SIZE = 24;

const parseCount = (value, fallback, min) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, parsed);
};

const getRequiredPreviewWidth = (topCount, stallSize, topGap, sideGap, spacedCenterGap) => {
  const topSlots = Math.max(topCount, 1) + 2;
  const topWidth = topSlots * stallSize + (topSlots - 1) * topGap;
  const bodyWidth = stallSize * 4 + spacedCenterGap + sideGap * 2;
  return Math.max(topWidth, bodyWidth);
};

const PreviewStallBox = ({ label, variant }) => (
  <div className={`stall-box ${variant}-stall`}>{label}</div>
);

const StallLayout = ({ setStallsData }) => {
  const [domes, setDomes] = useState([]);
  const [selectedDome, setSelectedDome] = useState("");
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [centerSpacing, setCenterSpacing] = useState("with-space");
  const [isLoadingDomes, setIsLoadingDomes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDomes = async () => {
      setIsLoadingDomes(true);
      setErrorMessage("");

      try {
        const data = await getAllDomes();
        if (!isMounted) return;
        setDomes(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error?.message || "Failed to load domes.");
      } finally {
        if (isMounted) {
          setIsLoadingDomes(false);
        }
      }
    };

    fetchDomes();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateCount = useCallback((field, value, min) => {
    setConfig((prev) => ({
      ...prev,
      [field]: parseCount(value, prev[field], min),
    }));
  }, []);

  const preview = useMemo(() => {
    const top = Array.from({ length: config.top }, (_, i) => `T${i + 1}`);
    const left = Array.from({ length: config.left }, (_, i) => `L${i + 1}`);
    const right = Array.from({ length: config.right }, (_, i) => `R${i + 1}`);
    const center = Array.from({ length: config.center }, (_, i) => ({
      left: `C${i * 2 + 1}`,
      right: `C${i * 2 + 2}`,
    }));

    return {
      top,
      left,
      right,
      center,
    };
  }, [config.center, config.left, config.right, config.top]);

  const previewSizing = useMemo(() => {
    const topCount = Math.max(config.top, 1);

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
      compactCenterGap,
    };
  }, [config.top]);

  const handleGenerate = useCallback(async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedDome) {
      setErrorMessage("Please select a dome first.");
      return;
    }

    const stalls = generateStallArray({
      topCount: config.top,
      centerCount: config.center,
      leftCount: config.left,
      rightCount: config.right,
      domeId: selectedDome,
      centerSpacing,
    });

    if (!stalls.length) {
      setErrorMessage("No stalls generated. Please check layout values.");
      return;
    }

    try {
      setIsSaving(true);
      const result = await saveStallsToDB(stalls);

      if (typeof setStallsData === "function") {
        setStallsData(result?.data || []);
      }

      setSuccessMessage(`Saved ${stalls.length} stalls successfully.`);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || "Failed to save stalls.");
    } finally {
      setIsSaving(false);
    }
  }, [centerSpacing, config.center, config.left, config.right, config.top, selectedDome, setStallsData]);

  return (
    <div className="layout-fluid-wrapper">
      <div className="layout-controls-panel">
        <h3 className="panel-title">Define Stall Layout</h3>

        <div className="input-group">
          <label>Select Dome</label>
          <select
            value={selectedDome}
            onChange={(e) => setSelectedDome(e.target.value)}
            disabled={isLoadingDomes || isSaving}
          >
            <option value="">-- Select Dome --</option>
            {domes.map((dome) => (
              <option key={dome._id} value={dome._id}>
                {dome.domeName}
              </option>
            ))}
          </select>
        </div>

        <div className="control-grid">
          <div className="input-group">
            <label>Top Row Stalls</label>
            <input
              type="number"
              min={MIN_COUNTS.top}
              value={config.top}
              onChange={(e) => updateCount("top", e.target.value, MIN_COUNTS.top)}
              disabled={isSaving}
            />
          </div>

          <div className="input-group">
            <label>Center Rows (Qty)</label>
            <input
              type="number"
              min={MIN_COUNTS.center}
              value={config.center}
              onChange={(e) => updateCount("center", e.target.value, MIN_COUNTS.center)}
              disabled={isSaving}
            />
          </div>

          <div className="input-group">
            <label>Left Column Stalls</label>
            <input
              type="number"
              min={MIN_COUNTS.left}
              value={config.left}
              onChange={(e) => updateCount("left", e.target.value, MIN_COUNTS.left)}
              disabled={isSaving}
            />
          </div>

          <div className="input-group">
            <label>Right Column Stalls</label>
            <input
              type="number"
              min={MIN_COUNTS.right}
              value={config.right}
              onChange={(e) => updateCount("right", e.target.value, MIN_COUNTS.right)}
              disabled={isSaving}
            />
          </div>

          <div className="input-group center-spacing-field">
            <label>Center Stall Spacing</label>
            <select
              className="spacing-select"
              value={centerSpacing}
              onChange={(e) => setCenterSpacing(e.target.value)}
              disabled={isSaving}
            >
              <option value="with-space">With Space</option>
              <option value="no-space">No Space</option>
            </select>
          </div>
        </div>

        {errorMessage ? <p className="manage-feedback manage-feedback-error">{errorMessage}</p> : null}
        {successMessage ? <p className="manage-feedback manage-feedback-success">{successMessage}</p> : null}

        <button
          className="admin-submit-btn-wide"
          onClick={handleGenerate}
          disabled={isSaving || isLoadingDomes || !domes.length}
        >
          {isSaving ? "Saving..." : "Generate & Save Stalls"}
        </button>
      </div>

      <div className="layout-visual-panel">
        <div className="preview-header">Stall Layout Preview</div>

        <div
          className="visual-map-container"
          style={{
            "--stall-size": `${previewSizing.stallSize}px`,
            "--stall-gap": `${previewSizing.topGap}px`,
            "--map-top-gap": `${previewSizing.topGap}px`,
            "--map-side-gap": `${previewSizing.sideGap}px`,
            "--center-gap-spaced": `${previewSizing.spacedCenterGap}px`,
            "--center-gap-compact": `${previewSizing.compactCenterGap}px`,
          }}
        >
          <div className="map-structure">
            <div className="map-top-left">
              <PreviewStallBox label={preview.left[0]} variant="left" />
            </div>

            <div className="map-top-center">
              {preview.top.map((stallNumber) => (
                <PreviewStallBox key={stallNumber} label={stallNumber} variant="top" />
              ))}
            </div>

            <div className="map-top-right">
              <PreviewStallBox label={preview.right[0]} variant="right" />
            </div>

            <div className="left-column">
              {preview.left.slice(1).map((stallNumber) => (
                <PreviewStallBox key={stallNumber} label={stallNumber} variant="left" />
              ))}
            </div>

            <div className="center-grid-shell">
              <div className={`center-grid ${centerSpacing === "with-space" ? "spaced" : "compact"}`}>
                {preview.center.map((pair) => (
                  <React.Fragment key={pair.left}>
                    <PreviewStallBox label={pair.left} variant="center" />
                    <PreviewStallBox label={pair.right} variant="center" />
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="right-column">
              {preview.right.slice(1).map((stallNumber) => (
                <PreviewStallBox key={stallNumber} label={stallNumber} variant="right" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StallLayout;
