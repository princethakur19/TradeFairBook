import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthItem, getStoredRole, hasValidSession } from '../utils/auth';
// Import your admin CSS here so it loads for all admin pages
import './styles/admin.css'; 

const AdminRoute = ({ children }) => {
  const token = getAuthItem('token');
  const role = getStoredRole();
  const isAdmin = Boolean(token) && (role === 'ADMIN' || role === 'SUPER_ADMIN');

  if (!hasValidSession() || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // IMPORTANT: You must render 'children' or the page will be blank!
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
};

export default AdminRoute;
