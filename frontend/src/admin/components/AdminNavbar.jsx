import React, { useState } from 'react';

const AdminNavbar = ({ activeSection, onSectionChange, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { key: 'dashboard-stats', label: 'Dashboard' },
    { key: 'dome-report', label: 'Dome Report' },
    { key: 'add-dome', label: 'Add Dome' },
    { key: 'manage-domes', label: 'Manage Domes' },
    { key: 'stall-layout', label: 'Stall Layout' },
    { key: 'manage-stalls', label: 'Manage Stalls' },
    { key: 'manage-materials', label: 'Manage Materials' },
    { key: 'manage-bookings', label: 'Manage Bookings' }
  ];

  return (
    <>
      {!isSidebarOpen && (
        <button
          type="button"
          className="sidebar-toggle floating"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Show admin sidebar"
          aria-expanded="false"
        >
          <span className="hamburger-icon" aria-hidden="true">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </span>
        </button>
      )}

      <aside className={`admin-sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="admin-sidebar-top">
          <div className="sidebar-top-row">
            <button type="button" className="nav-brand" onClick={() => onSectionChange('dashboard-stats')}>
              <div className="brand-logo-container">
                <i className="fas fa-landmark"></i>
              </div>
              <span className="brand-text">
                TradeFair <span className="brand-bold">Book</span>
              </span>
            </button>

            <button
              type="button"
              className="sidebar-toggle inline"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Hide admin sidebar"
              aria-expanded="true"
            >
              <span className="hamburger-icon" aria-hidden="true">
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </span>
            </button>
          </div>

          <div className="admin-sidebar-label">Admin Panel</div>

          <nav className="nav-links" aria-label="Admin navigation">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
                onClick={() => onSectionChange(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="admin-sidebar-footer">
          <button className="nav-item logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminNavbar;
