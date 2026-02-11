import React, { useState } from 'react';

const AddDome = () => {
  const [formData, setFormData] = useState({
    domeName: '',
    location: 'Mumbai',
    description: '',
    imageUrl: '',
    status: 'ACTIVE'
  });

  return (
    <div className="admin-fluid-card">
      <h2 style={{ fontSize: '1.9rem', marginBottom: '30px', borderBottom: '1px solid #2a2a2a', paddingBottom: '16px' }}>
        Add Dome
      </h2>

      <div className="form-grid">
        <div className="input-group">
          <label>DOME NAME</label>
          <input
            type="text"
            placeholder="e.g., Technology Dome"
            value={formData.domeName}
            onChange={(e) => setFormData({ ...formData, domeName: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label>LOCATION</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="input-group full-span">
          <label>DESCRIPTION</label>
          <textarea
            placeholder="Enter dome details..."
            rows="5"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label>DOME IMAGE URL</label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label>DOME STATUS</label>
          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <button
          className="admin-submit-btn-wide full-span"
          style={{ background: 'transparent', border: '1px solid #2962ff', color: '#fff' }}
        >
          Add Dome
        </button>
      </div>
    </div>
  );
};

export default AddDome;
