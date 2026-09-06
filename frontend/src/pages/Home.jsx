import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import HowItWorks from "../components/home/HowItWorks";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAllDomes } from "../services/domeService";
import { defaultDomes } from "../data/defaultDomes";
import { hasValidSession, setRedirectAfterLogin } from "../utils/auth";

import "../styles/layout.css";
import "../styles/home.css";
import "../styles/domeSelection.css";

const Home = () => {
  const navigate = useNavigate();
  const [domes, setDomes] = useState([]);
  const [loadingDomes, setLoadingDomes] = useState(true);
  const [domeError, setDomeError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchDomes = async () => {
      try {
        setLoadingDomes(true);
        setDomeError("");

        const response = await getAllDomes();
        const domeList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        setDomes(domeList);
      } catch (error) {
        console.error("Error fetching domes:", error);
        setDomes(defaultDomes);
        setDomeError("");
      } finally {
        setLoadingDomes(false);
      }
    };

    fetchDomes();
  }, []);

  const handleViewStalls = (domeId) => {
    const isAuthenticated = hasValidSession();

    if (isAuthenticated) {
      navigate(`/stalls/${domeId}`);
    } else {
      setRedirectAfterLogin(`/stalls/${domeId}`);
      navigate("/login");
    }
  };

  const formatPrice = (value) => `INR ${Number(value || 0).toLocaleString()}`;
  const getDomeStatusClass = (status) => (status || "INACTIVE").toLowerCase();

  return (
    <div className="home-wrapper">
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <div className="location-badge">
            <i className="fas fa-map-marker-alt"></i> Mumbai Exhibition Center
          </div>
          <h1>The Smart Way to <br />Book Exhibition Stalls</h1>
          <p>
            Secure your spot in Mumbai&apos;s premier trade zones. Real-time availability,
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
        </div>
      </section>

      <main className="dome-page" id="domes" style={{ paddingTop: "20px" }}>
        <section className="dome-header" style={{ paddingTop: "40px", paddingBottom: "40px", background: "transparent" }}>
          <h1 style={{ fontSize: "2.5rem" }}>Available Zones</h1>
          <p>Select a dome to view layout and availability</p>
        </section>

        <section className="dome-container">
          <div className="dome-grid">
            {loadingDomes && <LoadingSpinner label="Loading domes..." />}
            {!loadingDomes && domeError && <p>{domeError}</p>}
            {!loadingDomes && !domeError && domes.length === 0 && <p>No domes available</p>}

            {!loadingDomes && !domeError && domes.map((dome) => (
              <div className="dome-card" key={dome._id}>
                <div className="dome-image">
                  <img
                    src={dome.image || "https://via.placeholder.com/400x250"}
                    alt={dome.domeName}
                    onError={(event) => {
                      event.currentTarget.src = "https://via.placeholder.com/400x250";
                    }}
                  />
                  <div className="dome-overlay"></div>
                  <span className={`dome-badge ${getDomeStatusClass(dome.status)}`}>
                    {dome.status || "INACTIVE"}
                  </span>
                </div>

                <div className="dome-content">
                  <h3>{dome.domeName}</h3>
                  <p>{dome.description || "No description available"}</p>

                  <div className="mt-auto">
                    <div className="dome-stats">
                      <div>
                        <h4>{formatPrice(dome.startingPrice)}</h4>
                        <span>Starting Price</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <h4>{dome.totalStalls || 0}</h4>
                        <span>Stalls</span>
                      </div>
                    </div>

                    <button onClick={() => handleViewStalls(dome._id)} className="dome-btn">
                      <i className="fas fa-search"></i> View Stalls
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Home;
