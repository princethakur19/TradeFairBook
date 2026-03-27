import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUserBookings } from "../../services/bookingService";
import {
  clearAuthStorage,
  getLoggedInUserId,
  getStoredRole,
  getUserDisplayName,
  hasValidSession
} from "../../utils/auth";
import "../../styles/layout.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [approvedNotifications, setApprovedNotifications] = useState([]);
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setIsNotificationOpen(false);

    const sessionActive = hasValidSession();
    setIsLoggedIn(sessionActive);
    setUserName(sessionActive ? getUserDisplayName() : "");
  }, [location]);

  useEffect(() => {
    if (!isLoggedIn) {
      setApprovedNotifications([]);
      setPendingPaymentCount(0);
      return undefined;
    }

    const role = getStoredRole();
    const userId = getLoggedInUserId();

    if (!userId || role === "ADMIN" || role === "SUPER_ADMIN") {
      setApprovedNotifications([]);
      setPendingPaymentCount(0);
      return undefined;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const response = await getUserBookings(userId);
        if (!isMounted) return;

        const bookings = Array.isArray(response?.data) ? response.data : [];
        const approvedBookings = bookings
          .filter((booking) => String(booking.status || "").toUpperCase() === "APPROVED")
          .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

        setApprovedNotifications(approvedBookings);
        setPendingPaymentCount(approvedBookings.length);
      } catch (_error) {
        if (!isMounted) return;
        setApprovedNotifications([]);
        setPendingPaymentCount(0);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn, location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    clearAuthStorage();
    setIsLoggedIn(false);
    setUserName("");
    setIsDropdownOpen(false);
    setIsNotificationOpen(false);
    setApprovedNotifications([]);
    setPendingPaymentCount(0);
    navigate("/login");
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.getAttribute("data-theme") === "dark") {
      html.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      html.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const getProfileInitial = () => {
    const source = String(userName || "U").trim();
    return source.charAt(0).toUpperCase();
  };

  const toggleNotifications = () => {
    const nextState = !isNotificationOpen;
    setIsNotificationOpen(nextState);
    setIsDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="nav-container">
        <Link to="/" className="logo">
          <i className="fas fa-landmark-dome"></i> TradeFair<span>Book</span>
        </Link>

        <ul className={`nav-menu ${isMobileMenuOpen ? "active" : ""}`}>
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/domes" className="nav-link">Domes</Link></li>
          <li><a href="/#how-it-works" className="nav-link">How it Works</a></li>

          <li>
            <button className="theme-toggle" onClick={toggleTheme}>
              <i className="fas fa-adjust"></i>
            </button>
          </li>

          {isLoggedIn ? (
            <li className="nav-notification-wrapper" ref={notificationRef}>
              <button
                type="button"
                className={`notification-trigger ${isNotificationOpen ? "active" : ""}`}
                onClick={toggleNotifications}
                aria-expanded={isNotificationOpen}
                aria-haspopup="menu"
                aria-label="Notifications"
              >
                <i className="fas fa-bell"></i>
                {pendingPaymentCount > 0 ? (
                  <span className="notification-badge">
                    {pendingPaymentCount > 9 ? "9+" : pendingPaymentCount}
                  </span>
                ) : null}
              </button>

              <div className={`notification-dropdown ${isNotificationOpen ? "open" : ""}`} role="menu">
                <div className="notification-dropdown-header">
                  <strong>Notifications</strong>
                  <span>{approvedNotifications.length}</span>
                </div>

                {approvedNotifications.length ? (
                  approvedNotifications.map((booking) => (
                    <Link
                      key={booking._id}
                      to="/my-bookings"
                      className="notification-item"
                      onClick={() => setIsNotificationOpen(false)}
                    >
                      <span className="notification-icon">
                        <i className="fas fa-circle-check"></i>
                      </span>
                      <span className="notification-copy">
                        <strong>{booking.dome?.domeName || "Booking approved"}</strong>
                        <span>
                          Admin approved stall {booking.stall?.stallNumber || "N/A"}. You can pay now.
                        </span>
                        <small>Open My Bookings to continue</small>
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="notification-empty">
                    No payment-ready approvals yet.
                  </div>
                )}
              </div>
            </li>
          ) : null}

          <li className="nav-profile-wrapper" ref={profileRef}>
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  className={`profile-trigger ${isDropdownOpen ? "active" : ""}`}
                  onClick={() => {
                    setIsDropdownOpen((prev) => !prev);
                    setIsNotificationOpen(false);
                  }}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                >
                  <span className="profile-avatar">{getProfileInitial()}</span>
                  <span className="profile-name">{userName || "My Account"}</span>
                  <i className={`fas ${isDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"} profile-caret`}></i>
                </button>

                <div className={`profile-dropdown ${isDropdownOpen ? "open" : ""}`} role="menu">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/my-bookings"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    type="button"
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </li>
        </ul>

        <div className="hamburger" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
