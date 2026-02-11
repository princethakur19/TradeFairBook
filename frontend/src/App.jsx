import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import DomeSelection from "./pages/DomeSelection";

// ADMIN
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminRoute from "./admin/AdminRoute";

function App() {
  return (
    <Routes>
      {/* USER ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/domes" element={<DomeSelection />} />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin/*" // Added * to handle nested admin views if needed
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;