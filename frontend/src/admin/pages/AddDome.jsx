import React, { useState } from "react";
import { createDome } from "../services/adminDomeServices";

const AddDome = () => {
  const [formData, setFormData] = useState({
    domeName: "",
    location: "Mumbai",
    description: "",
    image: "",
    status: "ACTIVE"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createDome(formData);

      alert("Dome Added Successfully ✅");

      // Reset form
      setFormData({
        domeName: "",
        location: "Mumbai",
        description: "",
        image: "",
        status: "ACTIVE"
      });

    } catch (error) {
      alert(error.message || "Error adding dome ❌");
    }
  };

  return (
    <div className="admin-fluid-card">
      <h2
        style={{
          fontSize: "1.9rem",
          marginBottom: "30px",
          borderBottom: "1px solid #2a2a2a",
          paddingBottom: "16px"
        }}
      >
        Add Dome
      </h2>

      {/* IMPORTANT: Wrap everything in form */}
      <form onSubmit={handleSubmit} className="form-grid">

        <div className="input-group">
          <label>DOME NAME</label>
          <input
            type="text"
            name="domeName"
            placeholder="e.g., Technology Dome"
            value={formData.domeName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>LOCATION</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group full-span">
          <label>DESCRIPTION</label>
          <textarea
            name="description"
            placeholder="Enter dome details..."
            rows="5"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>DOME IMAGE URL</label>
          <input
            type="url"
            name="image"
            placeholder="https://example.com/image.jpg"
            value={formData.image}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>DOME STATUS</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <button
          type="submit"
          className="admin-submit-btn-wide full-span"
          style={{
            background: "transparent",
            border: "1px solid #2962ff",
            color: "#fff"
          }}
        >
          Add Dome
        </button>

      </form>
    </div>
  );
};

export default AddDome;
