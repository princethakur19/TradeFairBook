import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  clearRedirectAfterLogin,
  clearAuthStorage,
  getRedirectAfterLogin,
  persistAuthSession,
} from "../utils/auth";
import "../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("USER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    clearAuthStorage();

    if (!email || !password) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role,
      });

      const data = res.data;

      persistAuthSession({
        token: data.token,
        role: data.role,
        user: data.user,
      });

      if (["ADMIN", "SUPER_ADMIN"].includes(String(data.role || "").toUpperCase())) {
        navigate("/admin");
      } else {
        const redirectAfterLogin = getRedirectAfterLogin();
        if (redirectAfterLogin) {
          clearRedirectAfterLogin();
          navigate(redirectAfterLogin);
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-page">
        <div className="auth-container">
          <h1>Login</h1>
          <p>Trade Fair Stall Booking System Accc</p>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Login As</label>
              <select
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <input
                type="email"
                name="login-email"
                placeholder="Email"
                className="form-input"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <input
                type="password"
                name="login-password"
                placeholder="Password"
                className="form-input"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "12px" }}>
                {error}
              </p>
            )}

            <button className="btn" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p style={{ marginTop: "15px", textAlign: "center", color: "black" }}>
            New user?{" "}
            <Link className="link" to="/register">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
