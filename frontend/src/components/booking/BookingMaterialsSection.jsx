import React from "react";
import "../../styles/bookingMaterials.css";

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const BookingMaterialsSection = ({
  includedMaterials,
  availableMaterials,
  materialQuantities,
  onQuantityChange,
  loading,
  error,
  extraMaterialTotal
}) => (
  <div className="booking-materials-stack">
    <section className="booking-materials-card">
      <div className="booking-materials-header">
        <h3>Included Materials</h3>
        <span>Free with stall</span>
      </div>
      <div className="booking-materials-list">
        {includedMaterials.map((material) => (
          <div className="booking-materials-row included" key={material.name}>
            <div>
              <strong>{material.name}</strong>
              <p>Included with every stall booking</p>
            </div>
            <span className="booking-materials-qty">x {material.quantity}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="booking-materials-card">
      <div className="booking-materials-header">
        <h3>Extra Materials</h3>
        <span>Optional add-ons</span>
      </div>

      {loading ? (
        <p className="booking-materials-empty">Loading materials...</p>
      ) : error ? (
        <p className="booking-materials-error">{error}</p>
      ) : availableMaterials.length === 0 ? (
        <p className="booking-materials-empty">No extra materials available for this dome.</p>
      ) : (
        <div className="booking-extras-table">
          <div className="booking-extras-head">
            <span>Material</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
          </div>
          {availableMaterials.map((material) => {
            const quantity = Number.parseInt(materialQuantities?.[material._id] || 0, 10) || 0;
            const subtotal = Number(material.price || 0) * quantity;

            return (
              <div className="booking-extras-item" key={material._id}>
                <div className="booking-extras-name">
                  <strong>{material.name}</strong>
                  <p>{material.description || "Optional booking material"}</p>
                </div>
                <span className="booking-extras-price">{formatInr(material.price)}</span>
                <div className="booking-qty-control">
                  <button type="button" onClick={() => onQuantityChange(material._id, quantity - 1)}>
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(event) => onQuantityChange(material._id, event.target.value)}
                  />
                  <button type="button" onClick={() => onQuantityChange(material._id, quantity + 1)}>
                    +
                  </button>
                </div>
                <span className="booking-extras-subtotal">{formatInr(subtotal)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="booking-extra-total">
        <span>Extra Materials Total</span>
        <strong>{formatInr(extraMaterialTotal)}</strong>
      </div>
    </section>
  </div>
);

export default BookingMaterialsSection;
