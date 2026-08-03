import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import UserRoute from "./components/UserRoute";
import DomeSelection from "./pages/DomeSelection";
import StallsDisplay from "./pages/StallsDisplay";
import UserStallLayout from "./pages/UserStallLayout";
import AadharUpload from "./pages/AadharUpload";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";

// ADMIN
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminRoute from "./admin/AdminRoute";

const adminDashboardElement = (
  <AdminRoute>
    <AdminDashboard /> <br />
  </AdminRoute>
);

function App() {
  const userStallsElement = (element) => <UserRoute>{element}</UserRoute>;

  return (
    <Routes>
      {/* USER ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/domes" element={<DomeSelection />} />
      <Route path="/profile" element={userStallsElement(<Profile />)} />
      <Route path="/my-bookings" element={userStallsElement(<MyBookings />)} />
      <Route path="/stalls/:domeId" element={userStallsElement(<StallsDisplay />)} />
      <Route path="/select-stall/:domeId" element={userStallsElement(<UserStallLayout />)} />
      <Route path="/aadhar-upload" element={userStallsElement(<AadharUpload />)} />
      <Route path="/aadhar-upload/:stallId" element={userStallsElement(<AadharUpload />)} />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={adminDashboardElement} />
      <Route path="/admin/dashboard" element={adminDashboardElement} />
      <Route path="/admin/dashboard/:section" element={adminDashboardElement} />
      <Route path="/admin/*" element={adminDashboardElement} />
    </Routes>
  );
}

export default App;
