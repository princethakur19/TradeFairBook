import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import DomeReport from './DomeReport';
import AddDome from './AddDome';
import StallLayout from './StallLayout';
import ManageStalls from './ManageStalls';
import ManageDomes from './ManageDomes';
import ManageMaterials from './ManageMaterials';
import DashboardStats from './DashboardStats';
import BookingManagement from './BookingManagement';
import '../styles/admin.css';

const VALID_SECTIONS = ['dashboard-stats', 'dome-report', 'add-dome', 'manage-domes', 'stall-layout', 'manage-stalls', 'manage-materials', 'manage-bookings'];

const getSectionFromPath = (pathName) => {
  const segments = pathName.split('/').filter(Boolean);
  const maybeSection = segments[2];
  return VALID_SECTIONS.includes(maybeSection) ? maybeSection : 'dashboard-stats';
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stallsData, setStallsData] = useState([]);

  const activeSection = useMemo(() => getSectionFromPath(location.pathname), [location.pathname]);

  const handleSectionChange = (section) => {
    navigate(`/admin/dashboard/${section}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-root">
      <AdminNavbar activeSection={activeSection} onSectionChange={handleSectionChange} onLogout={handleLogout} />
      <div className="admin-viewport">
        {activeSection === 'dashboard-stats' && <DashboardStats />}
        {activeSection === 'dome-report' && <DomeReport />}
        {activeSection === 'add-dome' && <AddDome />}
        {activeSection === 'manage-domes' && <ManageDomes />}
        {activeSection === 'stall-layout' && <StallLayout setStallsData={setStallsData} />}
        {activeSection === 'manage-stalls' && <ManageStalls stallsData={stallsData} setStallsData={setStallsData} />}
        {activeSection === 'manage-materials' && <ManageMaterials />}
        {activeSection === 'manage-bookings' && <BookingManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
