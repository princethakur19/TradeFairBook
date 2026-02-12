import React from 'react';

const AdminNavbar = ({ activeSection, onSectionChange, onLogout }) => {
  return (
    <nav className="navbar">
      <button type="button" className="nav-brand" onClick={() => onSectionChange('dome-report')}>
        <div className="brand-logo-container">
          <i className="fas fa-landmark"></i>
        </div>
        <span className="brand-text">
          TradeFair <span className="brand-bold">Book</span>
        </span>
      </button>

      <div className="nav-links">
        <button
          className={`nav-item ${activeSection === 'dome-report' ? 'active' : ''}`}
          onClick={() => onSectionChange('dome-report')}
        >
          Dome Report
        </button>
        <button
          className={`nav-item ${activeSection === 'add-dome' ? 'active' : ''}`}
          onClick={() => onSectionChange('add-dome')}
        >
          Add Dome
        </button>
        <button
          className={`nav-item ${activeSection === 'stall-layout' ? 'active' : ''}`}
          onClick={() => onSectionChange('stall-layout')}
        >
          Stall Layout
        </button>
        <button
          className={`nav-item ${activeSection === 'manage-stalls' ? 'active' : ''}`}
          onClick={() => onSectionChange('manage-stalls')}
        >
          Manage Stalls
        </button>
        <button className="nav-item logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
