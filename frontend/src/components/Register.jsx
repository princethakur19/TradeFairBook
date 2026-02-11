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
    <div className="auth-screen">
      <div className="auth-page">
        <div className="auth-container">
          <h1>Create Account</h1>
          <p>Join the Trade Fair</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              name="fullname"
              className="form-input"
              placeholder="Full Name"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              name="company"
              className="form-input"
              placeholder="Company Name"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              name="phone"
              className="form-input"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              name="password"
              type="password"
              className="form-input"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />{" "}
              I agree to terms
            </label>
          </div>

          <button className="btn">Create Account</button>
        </form>

        <p style={{ marginTop: "15px", textAlign: "center", color: "#0f172a" }}>
          Already registered?{" "}
          <Link className="link" to="/">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
