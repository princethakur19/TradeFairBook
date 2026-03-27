import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getLoggedInUserId, getStoredRole, getStoredUser, getUserDisplayName } from "../utils/auth";
import "../styles/layout.css";

const Profile = () => {
  const user = getStoredUser();
  const displayName = getUserDisplayName() || "User";
  const email = user?.email || "Not available";
  const userRole = user?.role || getStoredRole() || "USER";
  const userId = user?._id || user?.id || getLoggedInUserId() || "Not available";

  return (
    <div className="home-wrapper">
      <Navbar />

      <main className="profile-page">
        <section className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-avatar">{displayName.charAt(0).toUpperCase()}</span>
            <div>
              <h1>{displayName}</h1>
              <p>Your account details</p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>Email</span>
              <strong>{email}</strong>
            </div>
            <div className="profile-info-item">
              <span>Role</span>
              <strong>{String(userRole).toUpperCase()}</strong>
            </div>
            <div className="profile-info-item">
              <span>User ID</span>
              <strong>{userId}</strong>
            </div>
            <div className="profile-info-item">
              <span>Bookings</span>
              <strong>
                <Link to="/my-bookings" className="profile-inline-link">
                  View My Bookings
                </Link>
              </strong>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
