import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import AddDome from './AddDome';
import StallLayout from './StallLayout';
import ManageStalls from './ManageStalls';
import '../styles/admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('add-dome');
  const [stallsData, setStallsData] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-root">
      <AdminNavbar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={handleLogout} />
      {/* The viewport area stretches to 100% width */}
      <div className="admin-viewport">
        {activeSection === 'add-dome' && <AddDome />}
        {activeSection === 'stall-layout' && <StallLayout setStallsData={setStallsData} />}
        {activeSection === 'manage-stalls' && <ManageStalls stallsData={stallsData} setStallsData={setStallsData} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
