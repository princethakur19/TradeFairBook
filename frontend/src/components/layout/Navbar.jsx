import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearAuthStorage, hasValidSession } from "../../utils/auth";
import "../../styles/layout.css"; 

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); 

  // ✅ FIXED: Wrapped in setTimeout to prevent "Cascading Render" error
  useEffect(() => {
    const timer = setTimeout(() => {
      // 1. Close mobile menu
      setIsMobileMenuOpen(false);

      // 2. Check login status
      setIsLoggedIn(hasValidSession());
    }, 0); // 0ms delay pushes this to the end of the queue

    return () => clearTimeout(timer); // Cleanup prevents memory leaks
  }, [location]);

  const handleLogout = () => {
    clearAuthStorage();
    setIsLoggedIn(false);
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

          <li>
            {isLoggedIn ? (
              <button 
                onClick={handleLogout} 
                className="btn-primary" 
                style={{ backgroundColor: "#ef4444", border: "none" }}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn-primary">
                Login / Register
              </Link>
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
