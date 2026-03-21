import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { getUserDisplayName } from "../utils/auth";
import "../styles/layout.css";

const readStoredUser = () => {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch (_error) {
    return null;
  }
};

const Profile = () => {
  const user = readStoredUser();
  const displayName = getUserDisplayName() || "User";
  const email = user?.email || "Not available";
  const userRole = user?.role || localStorage.getItem("role") || "USER";
  const userId = user?._id || user?.id || localStorage.getItem("userId") || "Not available";

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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
