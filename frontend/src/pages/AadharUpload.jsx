import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../api/axios";
import { getLoggedInUserId } from "../utils/auth";
import "../styles/aadharUpload.css";

const AadharUpload = () => {
  const { stallId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookingContext, setBookingContext] = useState(location.state?.bookingContext || null);
  const [aadharName, setAadharName] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [aadharImage, setAadharImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState(false);

  const maskedAadhar = useMemo(() => {
    const digits = aadharNumber.replace(/\D/g, "").slice(0, 12);
    const parts = digits.match(/.{1,4}/g) || [];
    return parts.join(" ");
  }, [aadharNumber]);

  useEffect(() => {
    const loadContextIfMissing = async () => {
      if (bookingContext || !stallId) return;

      try {
        setLoadingContext(true);
        const res = await api.get(`/stalls/one/${stallId}`);
        const stall = res.data?.data;
        if (!stall) {
          setError("Invalid stall selected. Please choose a stall again.");
          return;
        }

        setBookingContext({
          domeId: stall.dome?._id || stall.dome,
          amount: stall.price,
          stallNumber: stall.stallNumber
        });
      } catch (ctxError) {
        console.error("Failed to load stall context:", ctxError);
        setError("Unable to load selected stall details. Please try again.");
      } finally {
        setLoadingContext(false);
      }
    };

    loadContextIfMissing();
  }, [bookingContext, stallId]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleAadharImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAadharImage(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      setAadharImage(null);
      setImagePreview("");
      return;
    }

    setError("");
    setAadharImage(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userId = getLoggedInUserId();
    if (!userId) {
      alert("Please log in to continue.");
      navigate("/login");
      return;
    }

    if (!bookingContext?.domeId) {
      setError("Missing stall details. Please return and select stall again.");
      return;
    }

    if (!aadharName.trim()) {
      setError("Please enter name exactly as on Aadhaar.");
      return;
    }

    const cleanedAadhar = aadharNumber.replace(/\D/g, "");
    if (cleanedAadhar.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    if (!aadharImage) {
      setError("Please upload your Aadhaar image.");
      return;
    }

    if (!consentChecked) {
      setError("Please provide consent to proceed.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("stall", stallId);
      formData.append("dome", bookingContext.domeId);
      formData.append("amount", bookingContext.amount);
      formData.append("aadharName", aadharName.trim());
      formData.append("aadharNumber", cleanedAadhar);
      formData.append("status", "PENDING");
      formData.append("aadharImage", aadharImage);

      await api.post("/bookings", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Verification successful. Stall booked successfully.");
      navigate(`/stalls/${bookingContext.domeId}`);
    } catch (submitError) {
      console.error("Booking with Aadhaar verification failed:", submitError);
      const message = submitError?.response?.data?.message || "Verification failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="aadhar-upload-page">
        <div className="aadhar-upload-card">
          <h1>Aadhaar Verification</h1>
          <p className="aadhar-subtitle">
            Verification is required before your stall booking is confirmed.
          </p>

          {bookingContext && (
            <div className="booking-context">
              <p><strong>Stall:</strong> {bookingContext.stallNumber || stallId}</p>
              <p><strong>Amount:</strong> INR {Number(bookingContext.amount || 0).toLocaleString()}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="aadhar-form">
            <label htmlFor="aadhar-image-input" className="upload-box">
              {imagePreview ? (
                <img src={imagePreview} alt="Aadhaar preview" className="aadhar-preview" />
              ) : (
                <div className="upload-placeholder">
                  <i className="fas fa-id-card" aria-hidden="true"></i>
                  <span>Upload Aadhaar image for verification</span>
                  <small>Only image files are allowed</small>
                </div>
              )}
            </label>

            <input
              id="aadhar-image-input"
              type="file"
              accept="image/*"
              onChange={handleAadharImageChange}
              className="upload-input"
            />

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="aadharName">Name as per Aadhaar</label>
                <input
                  id="aadharName"
                  type="text"
                  value={aadharName}
                  onChange={(event) => setAadharName(event.target.value)}
                  placeholder="Enter full name"
                  autoComplete="name"
                />
              </div>

              <div className="form-field">
                <label htmlFor="aadharNumber">Aadhaar Number</label>
                <input
                  id="aadharNumber"
                  type="text"
                  value={maskedAadhar}
                  onChange={(event) => setAadharNumber(event.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  inputMode="numeric"
                />
              </div>
            </div>

            <label className="consent-row">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(event) => setConsentChecked(event.target.checked)}
              />
              <span>I confirm these Aadhaar details are accurate for verification.</span>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="submit-btn" disabled={loading || loadingContext}>
              {loadingContext ? "Loading..." : loading ? "Verifying..." : "Verify & Confirm Booking"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AadharUpload;
