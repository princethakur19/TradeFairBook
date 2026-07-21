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
  const [isDarkTheme, setIsDarkTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark"
  );
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
      setIsDarkTheme(false);
    } else {
      html.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      setIsDarkTheme(true);
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
            <button
              type="button"
              className={`theme-toggle ${isDarkTheme ? "dark" : ""}`}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              aria-pressed={isDarkTheme}
            >
              <svg viewBox="0 0 69.667 44" aria-hidden="true" focusable="false">
                <g transform="translate(3.5 3.5)">
                  <rect className="theme-toggle-track" rx="17.5" height="35" width="60.667" />
                  <g className="theme-toggle-thumb" transform="translate(2.333 2.333)">
                    <g className="theme-toggle-sun">
                      <circle className="theme-toggle-sun-outer" r="15.167" cy="15.167" cx="15.167" />
                      <circle className="theme-toggle-sun-glow" r="11.667" cy="15.167" cx="15.167" />
                      <circle className="theme-toggle-sun-inner" r="7" cy="15.167" cx="15.167" />
                    </g>
                    <g className="theme-toggle-moon" transform="translate(25.667 0)">
                      <circle className="theme-toggle-moon-body" r="15.167" cy="15.167" cx="15.167" />
                      <g className="theme-toggle-moon-patches">
                        <circle r="2" cy="6.5" cx="18.6" />
                        <circle r="2" cy="20" cx="15" />
                        <circle r="1" cy="10" cx="8.7" />
                        <circle r="1" cy="20.9" cx="26.8" />
                        <circle r="1.5" cy="12.5" cx="25.8" />
                      </g>
                    </g>
                  </g>
                  <path
                    className="theme-toggle-cloud"
                    d="M46.34,12.88c1.1,0,2.12,.29,3.01,.8,.06-.86,.73-1.55,1.58-1.65,1.22-.14,2.32,.12,3.26,.68,.02-1.14,.4-2.06,1.13-2.68,.9-.76,2.24-.86,3.25-.24,.91,.56,1.33,1.58,1.12,2.62,1.85,.03,3.25,.7,3.85,1.84,.68,1.3,.06,2.47-.62,3.18,.83,.22,1.58,.55,2.23,.98,.58,.38,.86,1.02,.75,1.72-.18,1.14-1.44,2.05-3.46,2.5-1.32,.3-2.79,.18-4.12-.34-.83-.33-1.42-1.01-1.75-1.8-.75,.76-1.62,1.25-2.53,1.25-1.1,0-2.06-.49-2.84-1.15-.92,.55-1.98,.76-3.16,.6-1.64-.22-2.77-.94-3.26-2.08-.36-.84-.27-1.74,.02-2.46-1.4-.53-2.35-1.57-2.35-2.78,0-1.64,1.75-2.97,3.89-2.97Z"
                  />
                  <g className="theme-toggle-stars">
                    <path d="M15.2 5.1l.9 1.8 2 .3-1.5 1.4 .4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" />
                    <path d="M24.5 13.8l.6 1.1 1.2.2-.9.8 .2 1.2-1.1-.6-1.1.6 .2-1.2-.9-.8 1.2-.2z" />
                    <path d="M10.1 23.5l.7 1.4 1.6.2-1.2 1.1 .3 1.6-1.4-.8-1.4.8 .3-1.6-1.2-1.1 1.6-.2z" />
                    <path d="M27.4 28.6l.5 1 .1 1.1-1-.5-1 .5 .2-1.1-.8-.8 1.1-.2z" />
                    <path d="M7.5 10.8l.5 1 .1 1.1-1-.5-1 .5 .2-1.1-.8-.8 1.1-.2z" />
                  </g>
                </g>
              </svg>
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
