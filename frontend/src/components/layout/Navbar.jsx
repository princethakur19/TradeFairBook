import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthStorage, getUserDisplayName, hasValidSession } from "../../utils/auth";
import "../../styles/layout.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);

    const sessionActive = hasValidSession();
    setIsLoggedIn(sessionActive);
    setUserName(sessionActive ? getUserDisplayName() : "");
  }, [location]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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

          <li className="nav-profile-wrapper" ref={profileRef}>
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  className={`profile-trigger ${isDropdownOpen ? "active" : ""}`}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
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
