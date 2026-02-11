import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    company: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const data = res.data;
      localStorage.setItem("token", data.token);
      alert("Login successful");
      navigate("/");
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
    <div className="auth-page login-page">
      <div className="auth-container login-container">
        <div className="auth-icon">👤</div>
        <h1>Login</h1>
        <p>Welcome Back Please Login To Your</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Login As</label>
          <select
            className="form-input"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter Your Email"
            className="form-input"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group password-group">
          <label>Password</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Your Password"
              className="form-input"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button className="btn login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="auth-footer">
        New user?{" "}
        <Link className="link" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;