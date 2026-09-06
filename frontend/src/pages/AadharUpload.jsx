import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import api from "../api/axios";
import { rememberFallbackBooking } from "../services/bookingService";
import { getLoggedInUserId } from "../utils/auth";
import { DEFAULT_INCLUDED_MATERIALS, getGrandTotal } from "../utils/bookingMaterials";
import "../styles/aadharUpload.css";
import "../styles/bookingMaterials.css";

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
  const stallAmount = Number(bookingContext?.stallAmount ?? bookingContext?.amount ?? 0);
  const defaultMaterials = Array.isArray(bookingContext?.defaultMaterials) && bookingContext.defaultMaterials.length
    ? bookingContext.defaultMaterials
    : DEFAULT_INCLUDED_MATERIALS;
  const extraMaterials = Array.isArray(bookingContext?.extraMaterials) ? bookingContext.extraMaterials : [];
  const extraMaterialTotal = Number(bookingContext?.extraMaterialTotal || 0);
  const grandTotal = getGrandTotal(stallAmount, extraMaterialTotal);

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
          stallAmount: stall.price,
          extraMaterialTotal: 0,
          grandTotal: stall.price,
          defaultMaterials: DEFAULT_INCLUDED_MATERIALS,
          extraMaterials: [],
          stallNumber: stall.stallNumber,
          stallIds: [stallId],
          stalls: [
            {
              _id: stallId,
              stallNumber: stall.stallNumber,
              side: stall.side,
              price: stall.price
            }
          ]
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

    const selectedStallIds = Array.isArray(bookingContext?.stallIds) && bookingContext.stallIds.length
      ? bookingContext.stallIds
      : stallId
        ? [stallId]
        : [];

    if (!selectedStallIds.length) {
      setError("Missing selected stalls. Please return and choose stalls again.");
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

      const aadhaarFormData = new FormData();
      aadhaarFormData.append("aadhaarName", aadharName.trim());
      aadhaarFormData.append("aadhaarNumber", cleanedAadhar);
      aadhaarFormData.append("aadhaarImage", aadharImage);

      const aadhaarRes = await api.post("/aadhaar/submit", aadhaarFormData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const aadhaarVerificationId = aadhaarRes?.data?.data?._id;
      if (!aadhaarVerificationId) {
        throw new Error("Aadhaar verification ID missing in response");
      }

      const bookingRes = await api.post("/bookings/create", {
        stallIds: selectedStallIds,
        aadhaarVerificationId,
        status: "PENDING",
        defaultMaterials,
        extraMaterials,
        extraMaterialTotal
      });
      rememberFallbackBooking(bookingRes.data);

      navigate("/my-bookings", {
        state: {
          message: `Verification successful. ${selectedStallIds.length} stall${
            selectedStallIds.length > 1 ? "s are" : " is"
          } now pending admin approval.`
        }
      });
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
              <p>
                <strong>Count:</strong> {bookingContext.stallIds?.length || (stallId ? 1 : 0)}
              </p>
              <p><strong>Stall Price:</strong> INR {stallAmount.toLocaleString()}</p>
              <p><strong>Extra Materials Total:</strong> INR {extraMaterialTotal.toLocaleString()}</p>
              <p><strong>Grand Total:</strong> INR {grandTotal.toLocaleString()}</p>
            </div>
          )}

          {bookingContext && (
            <div className="booking-summary-stack">
              <section className="booking-materials-card">
                <div className="booking-materials-header">
                  <h3>Included Materials</h3>
                  <span>Free with stall</span>
                </div>
                <div className="booking-materials-list">
                  {defaultMaterials.map((material) => (
                    <div className="booking-materials-row included" key={material.name}>
                      <div>
                        <strong>{material.name}</strong>
                        <p>Included in stall price</p>
                      </div>
                      <span className="booking-materials-qty">x {material.quantity}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="booking-materials-card">
                <div className="booking-materials-header">
                  <h3>Extra Materials</h3>
                  <span>Optional purchase</span>
                </div>
                {extraMaterials.length ? (
                  <div className="booking-materials-list">
                    {extraMaterials.map((material) => (
                      <div className="booking-materials-row" key={`${material.materialId || material.name}`}>
                        <div>
                          <strong>{material.name}</strong>
                          <p>
                            {Number(material.quantity || 0)} x INR {Number(material.price || 0).toLocaleString()}
                          </p>
                        </div>
                        <span className="booking-materials-qty">
                          INR {Number(material.subtotal || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="booking-materials-empty">No extra materials selected.</p>
                )}

                <div className="booking-extra-total">
                  <span>Extra Materials Total</span>
                  <strong>INR {extraMaterialTotal.toLocaleString()}</strong>
                </div>
              </section>
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
