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
                  <g transform="matrix(1, 0, 0, 1, -3.5, -3.5)">
                    <rect className="theme-switch-container" transform="translate(3.5 3.5)" rx="17.5" height="35" width="60.667" />
                  </g>

                  <g className="theme-switch-button" transform="translate(2.333 2.333)">
                    <g className="theme-switch-sun">
                      <g transform="matrix(1, 0, 0, 1, -5.83, -5.83)">
                        <circle className="theme-switch-sun-outer" transform="translate(5.83 5.83)" r="15.167" cy="15.167" cx="15.167" />
                      </g>
                      <g transform="matrix(1, 0, 0, 1, -5.83, -5.83)">
                        <path className="theme-switch-sun-glow" transform="translate(9.33 9.33)" d="M11.667,0A11.667,11.667,0,1,1,0,11.667,11.667,11.667,0,0,1,11.667,0Z" />
                      </g>
                      <circle className="theme-switch-sun-inner" transform="translate(8.167 8.167)" r="7" cy="7" cx="7" />
                    </g>

                    <g className="theme-switch-moon">
                      <g transform="matrix(1, 0, 0, 1, -31.5, -5.83)">
                        <circle className="theme-switch-moon-body" transform="translate(31.5 5.83)" r="15.167" cy="15.167" cx="15.167" />
                      </g>
                      <g className="theme-switch-patches" transform="translate(-24.415 -1.009)">
                        <circle transform="translate(43.009 4.496)" r="2" cy="2" cx="2" />
                        <circle transform="translate(39.366 17.952)" r="2" cy="2" cx="2" />
                        <circle transform="translate(33.016 8.044)" r="1" cy="1" cx="1" />
                        <circle transform="translate(51.081 18.888)" r="1" cy="1" cx="1" />
                        <circle transform="translate(33.016 22.503)" r="1" cy="1" cx="1" />
                        <circle transform="translate(50.081 10.53)" r="1.5" cy="1.5" cx="1.5" />
                      </g>
                    </g>
                  </g>

                  <g transform="matrix(1, 0, 0, 1, -3.5, -3.5)">
                    <path className="theme-switch-cloud" transform="translate(-3466.47 -160.94)" d="M3512.81,173.815a4.463,4.463,0,0,1,2.243.62.95.95,0,0,1,.72-1.281,4.852,4.852,0,0,1,2.623.519c.034.02-.5-1.968.281-2.716a2.117,2.117,0,0,1,2.829-.274,1.821,1.821,0,0,1,.854,1.858c.063.037,2.594-.049,3.285,1.273s-.865,2.544-.807,2.626a12.192,12.192,0,0,1,2.278.892c.553.448,1.106,1.992-1.62,2.927a7.742,7.742,0,0,1-3.762-.3c-1.28-.49-1.181-2.65-1.137-2.624s-1.417,2.2-2.623,2.2a4.172,4.172,0,0,1-2.394-1.206,3.825,3.825,0,0,1-2.771.774c-3.429-.46-2.333-3.267-2.2-3.55A3.721,3.721,0,0,1,3512.81,173.815Z" />
                  </g>

                  <g className="theme-switch-stars" transform="translate(3.585 1.325)">
                    <path transform="matrix(-1, 0.017, -0.017, -1, 24.231, 3.055)" d="M.774,0,.566.559,0,.539.458.933.25,1.492l.485-.361.458.394L1.024.953,1.509.592.943.572Z" />
                    <path transform="matrix(-0.777, 0.629, -0.629, -0.777, 23.185, 12.358)" d="M1.341.529.836.472.736,0,.505.46,0,.4.4.729l-.231.46L.605.932l.4.326L.9.786Z" />
                    <path transform="matrix(0.438, 0.899, -0.899, 0.438, 23.177, 29.735)" d="M.015,1.065.475.9l.285.365L.766.772l.46-.164L.745.494.751,0,.481.407,0,.293.285.658Z" />
                    <path transform="translate(12.677 0.388) rotate(104)" d="M1.161,1.6,1.059,1,1.574.722.962.607.86,0,.613.572,0,.457.446.881.2,1.454l.516-.274Z" />
                    <path transform="matrix(-0.07, 0.998, -0.998, -0.07, 11.066, 15.457)" d="M.873,1.648l.114-.62L1.579.945,1.03.62,1.144,0,.706.464.157.139.438.7,0,1.167l.592-.083Z" />
                    <path transform="translate(8.326 28.061) rotate(11)" d="M.593,0,.638.724,0,.982l.7.211.045.724.36-.64.7.211L1.342.935,1.7.294,1.063.552Z" />
                    <path transform="translate(5.012 5.962) rotate(172)" d="M.816,0,.5.455,0,.311.323.767l-.312.455.516-.215.323.456L.827.911,1.343.7.839.552Z" />
                    <path transform="translate(2.218 14.616) rotate(169)" d="M1.261,0,.774.571.114.3.487.967,0,1.538.728,1.32l.372.662.047-.749.728-.218L1.215.749Z" />
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
