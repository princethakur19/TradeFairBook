import React from 'react';
import { Navigate } from 'react-router-dom';
// Import your admin CSS here so it loads for all admin pages
import './styles/admin.css'; 

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = String(localStorage.getItem('role') || '').toUpperCase();
  const isAdmin = Boolean(token) && (role === 'ADMIN' || role === 'SUPER_ADMIN');

  if (!isAdmin) {
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
