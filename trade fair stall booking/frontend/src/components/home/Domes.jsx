import { useNavigate } from "react-router-dom";

const domes = [
  {
    name: "Gateway Pavilion",
    price: "₹20,000",
    badge: "Main Entrance",
    img: "https://images.unsplash.com/photo-1590642916589-592bca10dfbf?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Bandra Business Dome",
    price: "₹15,000",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Andheri Expo Hall",
    price: "₹10,000",
    img: "https://images.unsplash.com/photo-1519567241046-7f570eee3d9f?q=80&w=2069&auto=format&fit=crop",
  },
  {
    name: "Marine Drive Pavilion",
    price: "₹7,000",
    img: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Powai Innovation Dome",
    price: "₹25,000",
    badge: "Exclusive",
    img: "https://images.unsplash.com/photo-1470723710355-171b443ad682?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Juhu Retail Plaza",
    price: "₹12,000",
    img: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2070&auto=format&fit=crop",
  },
];

const Domes = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleViewStalls = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/stalls"); // next page
    }
  };

  return (
    <section className="section" id="domes">
      <div className="section-header reveal">
        <h2>Explore by Location</h2>
        <p>Select a strategic zone on the exhibition map.</p>
      </div>

      <div className="card-grid">
        {domes.map((dome, index) => (
          <div className="dome-card reveal" key={index}>
            <div className="card-img-header">
              <img src={dome.img} alt={dome.name} />
              <div className="card-img-overlay"></div>
              {dome.badge && (
                <span className="dome-badge">{dome.badge}</span>
              )}
            </div>

            <div className="card-body">
              <h3>{dome.name}</h3>
              <p className="dome-desc">Premium exhibition zone</p>

              <div className="price-tag">
                {dome.price} <span>/ day</span>
              </div>

              <button className="btn-outline" onClick={handleViewStalls}>
                View Stalls
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Domes;
