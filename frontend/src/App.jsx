import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import DomeSelection from "./pages/DomeSelection";

// ADMIN
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminRoute from "./admin/AdminRoute";

const adminDashboardElement = (
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
);

function App() {
  return (
    <Routes>
      {/* USER ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/domes" element={<DomeSelection />} />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={adminDashboardElement} />
      <Route path="/admin/dashboard" element={adminDashboardElement} />
      <Route path="/admin/dashboard/:section" element={adminDashboardElement} />
      <Route path="/admin/*" element={adminDashboardElement} />
    </Routes>
  );
}

export default App;
