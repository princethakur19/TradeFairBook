import React, { useState } from 'react';

const StallLayout = ({ setStallsData }) => {
  const [config, setConfig] = useState({
    top: 5,
    center: 4,
    left: 7,
    right: 7,
    dome: 'Technology Dome'
  });

  const updateCount = (field, value, min = 0) => {
    const parsed = Number.parseInt(value, 10);
    setConfig((prev) => ({ ...prev, [field]: Number.isNaN(parsed) ? min : Math.max(min, parsed) }));
  };

  const handleGenerate = () => {
    const stalls = [];
    const domeName = config.dome;

    stalls.push({ id: 'L1', side: 'LEFT', price: 5000, status: 'AVAILABLE', dome: domeName });
    for (let i = 1; i <= config.top; i++) {
      stalls.push({ id: `T${i}`, side: 'TOP', price: 7000, status: 'AVAILABLE', dome: domeName });
    }
    stalls.push({ id: 'R1', side: 'RIGHT', price: 5000, status: 'AVAILABLE', dome: domeName });

    const maxRows = Math.max(config.left, config.right);
    for (let r = 2; r <= maxRows; r++) {
      if (r <= config.left) stalls.push({ id: `L${r}`, side: 'LEFT', price: 5000, status: 'AVAILABLE', dome: domeName });
      if (r <= config.right) stalls.push({ id: `R${r}`, side: 'RIGHT', price: 5000, status: 'AVAILABLE', dome: domeName });
    }

    for (let r = 0; r < config.center; r++) {
      stalls.push({ id: `C${r * 2 + 1}`, side: 'CENTER', price: 6500, status: 'AVAILABLE', dome: domeName });
      stalls.push({ id: `C${r * 2 + 2}`, side: 'CENTER', price: 6500, status: 'AVAILABLE', dome: domeName });
    }

    setStallsData(stalls);
    alert('Layout generated and ready for table view!');
  };

  return (
    <div className="layout-fluid-wrapper">
      <div className="layout-controls-panel">
        <h3 className="panel-title">Define Stall Layout</h3>

        <div className="input-group">
          <label>Select Dome</label>
          <select value={config.dome} onChange={(e) => setConfig({ ...config, dome: e.target.value })}>
            <option>Technology Dome</option>
            <option>Lifestyle Dome</option>
          </select>
        </div>

        <div className="control-grid">
          <div className="input-group">
            <label>Top Row Stalls</label>
            <input
              type="number"
              min="0"
              value={config.top}
              onChange={(e) => updateCount('top', e.target.value, 0)}
            />
          </div>
          <div className="input-group">
            <label>Center Rows (Qty)</label>
            <input
              type="number"
              min="0"
              value={config.center}
              onChange={(e) => updateCount('center', e.target.value, 0)}
            />
          </div>
          <div className="input-group">
            <label>Left Column Stalls</label>
            <input
              type="number"
              min="1"
              value={config.left}
              onChange={(e) => updateCount('left', e.target.value, 1)}
            />
          </div>
          <div className="input-group">
            <label>Right Column Stalls</label>
            <input
              type="number"
              min="1"
              value={config.right}
              onChange={(e) => updateCount('right', e.target.value, 1)}
            />
          </div>
        </div>

        <p className="form-note">* System auto-calculates placement in C-shape style with center rows inside.</p>

        <button className="admin-submit-btn-wide" onClick={handleGenerate}>
          Generate / Update Layout
        </button>
      </div>

      <div className="layout-visual-panel">
        <div className="preview-header">Stall Layout Preview</div>

        <div className="visual-map-container">
          <div className="map-row" style={{ gridTemplateColumns: `48px repeat(${config.top}, 48px) 48px` }}>
            <div className="stall-box">L1</div>
            {[...Array(config.top)].map((_, i) => (
              <div key={i} className="stall-box top-stall">T{i + 1}</div>
            ))}
            <div className="stall-box">R1</div>
          </div>

          <div className="map-body">
            <div className="side-column">
              {[...Array(config.left - 1)].map((_, i) => (
                <div key={i} className="stall-box">L{i + 2}</div>
              ))}
            </div>

            <div className="center-column-pair">
              {[...Array(config.center)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="stall-box center-stall">C{i * 2 + 1}</div>
                  <div className="stall-box center-stall">C{i * 2 + 2}</div>
                </React.Fragment>
              ))}
            </div>

            <div className="side-column">
              {[...Array(config.right - 1)].map((_, i) => (
                <div key={i} className="stall-box">R{i + 2}</div>
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
