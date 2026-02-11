const Hero = ({ goToDomes }) => {
  return (
    <section className="hero">
      <div className="hero-content reveal">
        <h1>
          Book Your Space at <br />
          <span style={{ color: "var(--primary)" }}>Global Expo 2026</span>
        </h1>

        <p>
          Join the world's leading trade event. Reserve premium stalls and
          showcase your brand to over 30,000 visitors.
        </p>

        <button className="btn-primary" onClick={goToDomes}>
          View Available Stalls
        </button>
      </div>

      <div className="hero-visual reveal">
        <div className="hero-img-container">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87"
            alt="Trade Fair"
          />
        </div>

        <div className="floating-badge">
          <div className="badge-icon">
            <i className="fas fa-check"></i>
          </div>
          <div>
            <div>Status</div>
            <strong>Registration Open</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
