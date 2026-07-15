import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAllDomes } from "../services/domeService";
import "../styles/domeSelection.css";

const DomeSelection = () => {
  const navigate = useNavigate();
  const [domes, setDomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDomeId, setSelectedDomeId] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchDomes = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAllDomes();
        const domeList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        setDomes(domeList);
        setSelectedDomeId(domeList[0]?._id || "");
      } catch (fetchError) {
        console.error("Error fetching domes:", fetchError);
        setError("Failed to load domes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDomes();
  }, []);

  const selectedDome = useMemo(
    () => domes.find((dome) => dome._id === selectedDomeId) || null,
    [domes, selectedDomeId]
  );

  const formatPrice = (value) => `INR ${Number(value || 0).toLocaleString()}`;
  const isDomeActive = (status) => status === "ACTIVE" || status === "AVAILABLE";
  const getDomeStatusClass = (status) => (status || "INACTIVE").toLowerCase();

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
            {loading && <LoadingSpinner label="Loading domes..." />}
            {!loading && error && <p>{error}</p>}
            {!loading && !error && domes.length === 0 && <p>No domes available</p>}

            {!loading &&
              !error &&
              domes.map((dome) => (
                <article
                  className={`dome-card ${selectedDomeId === dome._id ? "selected" : ""}`}
                  key={dome._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedDomeId(dome._id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedDomeId(dome._id);
                    }
                  }}
                >
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
                    <p className="dome-location-text">{dome.location || "Location unavailable"}</p>
                    <p>{dome.description || "No description available"}</p>

                    <div className="mt-auto">
                      <div className="dome-stats">
                        <div>
                          <h4>{formatPrice(dome.startingPrice || dome.price || dome.basePrice || 0)}</h4>
                          <span>Starting Price</span>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <h4>{dome.totalStalls || dome.stalls || 0}</h4>
                          <span>Stalls</span>
                        </div>
                      </div>

                      {isDomeActive(dome.status) ? (
                        <div className="dome-btn-row">
                          <button
                            type="button"
                            className="dome-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/stalls/${dome._id}`);
                            }}
                          >
                            <i className="fas fa-search"></i> View Stalls
                          </button>
                        </div>
                      ) : (
                        <button
                          className="dome-btn"
                          style={{
                            backgroundColor: "#9ca3af",
                            cursor: "not-allowed"
                          }}
                          disabled
                        >
                          Not Available
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
          </div>

          {selectedDome ? (
            <div className="dome-insight-card">
              <h2>{selectedDome.domeName}</h2>
              <p>{selectedDome.description || "No description available."}</p>
              <div className="dome-insight-grid">
                <div>
                  <span>Total</span>
                  <strong>{selectedDome.totalStalls || 0}</strong>
                </div>
                <div>
                  <span>Available</span>
                  <strong>{selectedDome.availableStalls || 0}</strong>
                </div>
                <div>
                  <span>Booked</span>
                  <strong>{selectedDome.bookedStalls || 0}</strong>
                </div>
                <div>
                  <span>Starting</span>
                  <strong>{formatPrice(selectedDome.startingPrice)}</strong>
                </div>
              </div>
              {isDomeActive(selectedDome.status) ? (
                <Link className="dome-insight-link" to={`/stalls/${selectedDome._id}`}>
                  Continue with {selectedDome.domeName}
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default DomeSelection;
