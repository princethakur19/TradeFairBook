import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    company: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!formData.terms) {
      alert("Please accept the terms");
      return;
    }

    try {
      await api.post("/auth/register", {
        fullname: formData.fullname,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      alert("Registration successful. Please login.");
      navigate("/");
    } catch (err) {
      alert(
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-container register-container">
        <div className="auth-icon">📝</div>
        <h1>Create Account</h1>
        <p>Join The Trade Fair Stall Booking Platform</p>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            name="fullname"
            className="form-input"
            placeholder="Enter Your Full Name"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Company Name</label>
          <input
            name="company"
            className="form-input"
            placeholder="Enter Your Company"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            name="email"
            type="email"
            className="form-input"
            placeholder="Enter Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            name="phone"
            className="form-input"
            placeholder="Enter Your Phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group password-group">
          <label>Password</label>
          <div className="password-container">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Create A Strong Password"
              value={formData.password}
              onChange={handleChange}
              required
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

        <div className="form-group password-group">
          <label>Confirm Password</label>
          <div className="password-container">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="form-input"
              placeholder="Confirm Your Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
            />
            I Agree To The Terms And Conditions
          </label>
        </div>

        <button className="btn register-btn">Create Account</button>
      </form>

      <p className="auth-footer">
        Already registered?{" "}
        <Link className="link" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;