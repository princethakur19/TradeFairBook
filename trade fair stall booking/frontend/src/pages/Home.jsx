import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HowItWorks from "../components/home/HowItWorks"; 
import southAtriumImg from "../assets/zones/south-atrium.jpg";

// Styles
import "../styles/layout.css"; 
import "../styles/home.css"; 
import "../styles/domeSelection.css"; 

const domesData = [
  {
    name: "North Wing",
    desc: "Premium high-footfall zone located directly at the main entrance.",
    price: "₹20,00",
    stalls: 50,
    img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=2070&auto=format&fit=crop",
    badge: "MAIN ENTRANCE",
    badgeColor: "#F59E0B"
  },
  {
    name: "South Try",
    desc: "Modern innovation hub equipped with high-speed internet and AC.",
    price: "₹15,000",
    stalls: 75,
    img: southAtriumImg,
    badge: "TECH HUB",
    badgeColor: "#F59E0B"
  },
  {
    name: "East Plaza",
    desc: "Bustling retail and lifestyle zone near the food court.",
    price: "₹10,000",
    stalls: 100,
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop",
    badge: "RETAIL",
    badgeColor: "#F59E0B"
  },
  {
    name: "West Pavilion",
    desc: "Cost-effective open layout perfect for startups and SMEs.",
    price: "₹7,000",
    stalls: 120,
    img: "https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=2070&auto=format&fit=crop",
    badge: "BUDGET",
    badgeColor: "#F59E0B"
  },
  {
    name: "Central Hall",
    desc: "The heart of the expo featuring the main stage and premium networking.",
    price: "₹25,000",
    stalls: 30,
    img: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=2073&auto=format&fit=crop",
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
          {/* <Link to="/login" className="btn-outline">Partner Login</Link> */}
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