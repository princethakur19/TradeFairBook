import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/domeSelection.css";

const DomeSelection = () => {
  const [domes, setDomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchDomes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/domes");
        setDomes(res.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching domes:", error);
        setLoading(false);
      }
    };

    fetchDomes();
  }, []);

  const getStatusColor = (status) => {
    if (status === "AVAILABLE") return "#16a34a"; // green
    if (status === "FULL") return "#dc2626"; // red
    return "#6b7280"; // gray
  };

  return (
    <>
      <Navbar />

      <main className="dome-page">
        <section className="dome-header">
          <div className="dome-location">
            <i className="fas fa-map-marker-alt"></i> Location: Mumbai
          </div>
          <h1>Select Your Dome</h1>
          <p>
            Explore our strategic exhibition zones designed for every business
            scale.
          </p>
        </section>

        <section className="dome-container">
          <div className="dome-grid">
            {loading && <p>Loading domes...</p>}

            {!loading && domes.length === 0 && (
              <p>No domes available</p>
            )}

            {!loading &&
              domes.map((dome) => (
                <div className="dome-card" key={dome._id}>
                  <div className="dome-image">
                    <img
                      src={dome.image}
                      alt={dome.domeName}
                    />
                    <div className="dome-overlay"></div>

                    <span
                      className="dome-badge"
                      style={{ color: getStatusColor(dome.status) }}
                    >
                      {dome.status}
                    </span>
                  </div>

                  <div className="dome-content">
                    <h3>{dome.domeName}</h3>
                    <p>{dome.description || "No description available"}</p>

                    <div className="mt-auto">
                      <div className="dome-stats">
                        <div>
                          <h4>₹ {dome.basePrice || "N/A"}</h4>
                          <span>Starting Price</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <h4>{dome.totalStalls}</h4>
                          <span>Stalls</span>
                        </div>
                      </div>

                      {dome.status === "AVAILABLE" ? (
                        <Link
                          to={`/stalls/${dome._id}`}
                          className="dome-btn"
                        >
                          <i className="fas fa-search"></i> View Stalls
                        </Link>
                      ) : (
                        <button
                          className="dome-btn"
                          style={{
                            backgroundColor: "#9ca3af",
                            cursor: "not-allowed"
                          }}
                          disabled
                        >
                          {dome.status === "FULL"
                            ? "Fully Booked"
                            : "Not Available"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default DomeSelection;
