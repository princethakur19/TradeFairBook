import React from 'react';

const AdminNavbar = ({ activeSection, setActiveSection, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        {/* Modern Icon Logo */}
        <div className="brand-logo-container">
           <i className="fas fa-landmark"></i>
        </div>
        <span className="brand-text">
          TradeFair <span className="brand-bold">Book</span>
        </span>
      </div>
      
      <div className="nav-links">
        <button 
          className={`nav-item ${activeSection === 'add-dome' ? 'active' : ''}`}
          onClick={() => setActiveSection('add-dome')}
        >Add Dome</button>
        <button 
          className={`nav-item ${activeSection === 'stall-layout' ? 'active' : ''}`}
          onClick={() => setActiveSection('stall-layout')}
        >Stall Layout</button>
        <button 
          className={`nav-item ${activeSection === 'manage-stalls' ? 'active' : ''}`}
          onClick={() => setActiveSection('manage-stalls')}
        >Manage Stalls</button>
        <button className="nav-item logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
