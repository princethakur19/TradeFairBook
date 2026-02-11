import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/domeSelection.css"; 
import southAtriumImg from "../assets/zones/south-atrium.jpg";


const domesData = [
  {
    name: "North Wing",
    desc: "Premium high-footfall zone located directly at the main entrance.",
    price: "₹20,000",
    stalls: 50,
    img: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=2070&auto=format&fit=crop",
    badge: "MAIN ENTRANCE",
    badgeColor: "#F59E0B" // Orange
  },
  {
  name: "South Atrium",
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
    badgeColor: "#7C3AED" // Purple
  },
  {
    name: "Garden Annex",
    desc: "Scenic outdoor spots with natural lighting for lifestyle brands.",
    price: "₹12,000",
    stalls: 40,
    img: "https://images.unsplash.com/photo-1558008258-3256797b43f3?q=80&w=2070&auto=format&fit=crop",
    badge: "OUTDOOR",
    badgeColor: "#059669" // Green
  },
];

const DomeSelection = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            Explore our strategic exhibition zones designed for every business scale.
          </p>
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

                    <Link to="/stalls" className="dome-btn">
                      <i className="fas fa-search"></i> View Stalls
                    </Link>
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