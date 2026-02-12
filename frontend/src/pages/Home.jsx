import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HowItWorks from "../components/home/HowItWorks"; 

// Styles
import "../styles/layout.css"; 
import "../styles/home.css"; 
import "../styles/domeSelection.css"; 

const domesData = [
  {
    name: "Dome @ NSCI",
    desc: "Mumbai's iconic pillar-less indoor stadium located on the sea face. Perfect for large-scale lifestyle exhibitions, concerts, and premium events.",
    price: "₹22,000",
    stalls: 50,
    img: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQeFJWDEGokLpauScqEuwixoqYmjdGz9wV0JvH3ckKMjO1ILb3EW7Vh0v6w6KCD",
    badge: "MAIN ENTRANCE",
    badgeColor: "#F59E0B"
  },
  {
    name: "South AtriumJio World Convention Centre",
    desc: "Modern innovation hub equipped with high-speed internet and AC.",
    price: "₹16,000",
    stalls: 75,
    img: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQCQwp7fgcM2CZkNzW-unL0O1Y_a-rnzGX3W1h0c1KV-kLUcZ7lviCgwo5lDTgZ",
    badge: "TECH HUB",
    badgeColor: "#F59E0B"
  },
  {
    name: "Bombay Exhibition Centre (NESCO)",
    desc: "Bustling retail and lifestyle zone near the food court.",
    price: "₹10,000",
    stalls: 100,
    img: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTa9yb4YRp9kax6j4pjggHkW6XZdBsZO-wS3d08Nk7--2OCUi6lHIsit4gZLpSz",
    badge: "RETAIL",
    badgeColor: "#F59E0B"
  },
  {
    name: "CIDCO Exhibition & Convention Centre",
    desc: "Cost-effective open layout perfect for startups and SMEs.",
    price: "₹7,000",
    stalls: 120,
    img: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTwnhBQveAfF8ay8u2FIfa7nwN_8TidBIZhVCTy4xDZmblVoh-zgf4Y_nMsJXby",
    badge: "BUDGET",
    badgeColor: "#F59E0B"
  },
  {
    name: "World Trade Center",
    desc: "The heart of the expo featuring the main stage and premium networking.",
    price: "₹25,000",
    stalls: 30,
    img: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ8I5a6j-xdWJ9xJmyto9QWdHU_hKxCJ5ODNMrsNd_SYplcAQGgV4JVq32diRLQ",
    badge: "EXCLUSIVE",
    badgeColor: "#7C3AED"
  },
  {
    name: "Garden Annex",
    desc: "Scenic outdoor spots with natural lighting for lifestyle brands.",
    price: "₹12,000",
    stalls: 40,
    img: "https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=2070&auto=format&fit=crop",
    badge: "OUTDOOR",
    badgeColor: "#059669"
  },
];

const Home = () => {
  const navigate = useNavigate(); // ✅ Hook for navigation

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ Auth Check Function
  const handleViewStalls = () => {
    // 1. Check if user token exists (Change "token" to whatever you use)
    const isAuthenticated = localStorage.getItem("token"); 

    if (isAuthenticated) {
      // 2. If logged in, go to Stalls
      navigate("/stalls");
    } else {
      // 3. If NOT logged in, go to Login
      navigate("/login");
    }
  };

  return (
    <div className="home-wrapper">
      <Navbar />
      
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <div className="location-badge">
            <i className="fas fa-map-marker-alt"></i> Mumbai Exhibition Center
          </div>
          <h1>The Smart Way to <br/>Book Exhibition Stalls</h1>
          <p>
            Secure your spot in Mumbai's premier trade zones. Real-time availability, 
            transparent pricing, and instant booking for businesses of all scales.
          </p>
          <div className="hero-buttons">
            <a href="#domes" className="btn-primary">Explore Domes</a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-img-container">
            <img 
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" 
              alt="Exhibition Center" 
            />
          </div>
          <div className="floating-badge">
            <div className="badge-icon"><i className="fas fa-check"></i></div>
            <div>
              <strong>200+ Stalls</strong>
              <div style={{fontSize: '0.8rem', opacity: 0.8}}>Booked this week</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DOMES SECTION */}
      <main className="dome-page" id="domes" style={{paddingTop: '20px'}}> 
        <section className="dome-header" style={{paddingTop: '40px', paddingBottom: '40px', background: 'transparent'}}>
          <h1 style={{fontSize: '2.5rem'}}>Available Zones</h1>
          <p>Select a dome to view layout and availability</p>
        </section>

        <section className="dome-container">
          <div className="dome-grid">
            {domesData.map((dome, index) => (
              <div className="dome-card" key={index}>
                <div className="dome-image">
                  <img src={dome.img} alt={dome.name} />
                  <div className="dome-overlay"></div>
                  {dome.badge && (
                    <span 
                      className="dome-badge" 
                      style={{ color: dome.badgeColor }}
                    >
                      {dome.badge}
                    </span>
                  )}
                </div>

                <div className="dome-content">
                  <h3>{dome.name}</h3>
                  <p>{dome.desc}</p>

                  <div className="mt-auto">
                    <div className="dome-stats">
                      <div>
                        <h4>{dome.price}</h4>
                        <span>Starting Price</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <h4>{dome.stalls}</h4>
                        <span>Stalls</span>
                      </div>
                    </div>

                    {/* ✅ CHANGED: Button with onClick Handler */}
                    <button onClick={handleViewStalls} className="dome-btn">
                      <i className="fas fa-search"></i> View Stalls
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 3. HOW IT WORKS SECTION */}
      <HowItWorks />

      <Footer />
    </div>
  );
};

export default Home;
