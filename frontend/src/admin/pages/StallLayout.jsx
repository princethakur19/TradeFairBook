import React, { useEffect, useState } from "react";
import { getAllDomes } from "../services/adminDomeServices";
import { generateStallArray, saveStallsToDB } from "../services/adminStallService";

const StallLayout = () => {
  const [domes, setDomes] = useState([]);
  const [selectedDome, setSelectedDome] = useState("");
  const [config, setConfig] = useState({
    top: 5,
    center: 4,
    left: 7,
    right: 7,
  });

  /* Load domes */
  useEffect(() => {
    const fetchDomes = async () => {
      const data = await getAllDomes();
      setDomes(data || []);
    };
    fetchDomes();
  }, []);

  const updateCount = (field, value, min = 0) => {
    const parsed = Number.parseInt(value, 10);
    setConfig((prev) => ({
      ...prev,
      [field]: Number.isNaN(parsed) ? min : Math.max(min, parsed),
    }));
  };

  const handleGenerate = async () => {
    if (!selectedDome) {
      alert("Please select dome first");
      return;
    }

    const stalls = generateStallArray({
      topCount: config.top,
      leftCount: config.left,
      rightCount: config.right,
      domeId: selectedDome,
    });

    await saveStallsToDB(stalls);
    alert("Layout generated and saved successfully!");
  };

  return (
    <div className="layout-fluid-wrapper">
      <div className="layout-controls-panel">
        <h3 className="panel-title">Define Stall Layout</h3>

        <div className="input-group">
          <label>Select Dome</label>
          <select
            value={selectedDome}
            onChange={(e) => setSelectedDome(e.target.value)}
          >
            <option value="">-- Select Dome --</option>
            {domes?.map((dome) => (
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
              min="0"
              value={config.top}
              onChange={(e) => updateCount("top", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Center Rows (Qty)</label>
            <input
              type="number"
              min="0"
              value={config.center}
              onChange={(e) => updateCount("center", e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Left Column Stalls</label>
            <input
              type="number"
              min="1"
              value={config.left}
              onChange={(e) => updateCount("left", e.target.value, 1)}
            />
          </div>

          <div className="input-group">
            <label>Right Column Stalls</label>
            <input
              type="number"
              min="1"
              value={config.right}
              onChange={(e) => updateCount("right", e.target.value, 1)}
            />
          </div>
        </div>

        <button className="admin-submit-btn-wide" onClick={handleGenerate}>
          Generate & Save Stalls
        </button>
      </div>

      {/* VISUAL C-SHAPE PREVIEW (RESTORED) */}
      <div className="layout-visual-panel">
        <div className="preview-header">Stall Layout Preview</div>

        <div className="visual-map-container">
          <div
            className="map-row"
            style={{
              gridTemplateColumns: `48px repeat(${config.top}, 48px) 48px`,
            }}
          >
            <div className="stall-box">L1</div>
            {[...Array(config.top)].map((_, i) => (
              <div key={i} className="stall-box top-stall">
                T{i + 1}
              </div>
            ))}
            <div className="stall-box">R1</div>
          </div>

          <div className="map-body">
            <div className="side-column">
              {[...Array(config.left - 1)].map((_, i) => (
                <div key={i} className="stall-box">
                  L{i + 2}
                </div>
              ))}
            </div>

            <div className="center-column-pair">
              {[...Array(config.center)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="stall-box center-stall">
                    C{i * 2 + 1}
                  </div>
                  <div className="stall-box center-stall">
                    C{i * 2 + 2}
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="side-column">
              {[...Array(config.right - 1)].map((_, i) => (
                <div key={i} className="stall-box">
                  R{i + 2}
                </div>
              ))}
            </div>
          </div>

          <div className="map-footer">
            <span className="exit-sign">EXIT v</span>
            <span className="entry-sign">^ ENTRY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StallLayout;
