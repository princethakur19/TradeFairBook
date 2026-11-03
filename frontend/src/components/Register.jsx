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
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError("");
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      setError("Please accept the terms to create an account.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/register", {
        fullname: formData.fullname.trim(),
        company: formData.company.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      navigate("/login", { state: { registrationSuccess: true } });
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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
          {error && <div className="auth-error" role="alert">{error}</div>}
          <div className="form-group">
            <input
              name="fullname"
              autoComplete="name"
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
              autoComplete="organization"
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
              autoComplete="email"
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
              type="tel"
              autoComplete="tel"
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
              autoComplete="new-password"
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
              autoComplete="new-password"
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

          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "15px", textAlign: "center", color: "#0f172a" }}>
          Already registered?{" "}
          <Link className="link" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
