import React, { useEffect, useMemo, useState } from "react";
import {
  createMaterial,
  deleteMaterial,
  getAllMaterials,
  updateMaterial
} from "../services/adminMaterialService";
import { getAllDomes } from "../services/adminDomeServices";

const initialForm = {
  dome: "",
  name: "",
  price: "",
  description: "",
  isActive: true
};

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const ManageMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [domes, setDomes] = useState([]);
  const [selectedDomeId, setSelectedDomeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDomes, setLoadingDomes] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const filteredMaterials = useMemo(() => {
    if (!selectedDomeId) return materials;
    return materials.filter((material) => material.dome?._id === selectedDomeId);
  }, [materials, selectedDomeId]);

  const totalMaterials = useMemo(() => filteredMaterials.length, [filteredMaterials]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllMaterials();
      setMaterials(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load materials.");
    } finally {
      setLoading(false);
    }
  };

  const loadDomes = async () => {
    try {
      setLoadingDomes(true);
      const domeList = await getAllDomes();
      setDomes(Array.isArray(domeList) ? domeList : []);
    } finally {
      setLoadingDomes(false);
    }
  };

  useEffect(() => {
    loadMaterials();
    loadDomes();
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const openAddModal = () => {
    setEditingMaterialId("");
    setFormData(initialForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (material) => {
    setEditingMaterialId(material._id);
    setFormData({
      dome: material.dome?._id || "",
      name: material.name || "",
      price: material.price ?? "",
      description: material.description || "",
      isActive: Boolean(material.isActive)
    });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = (forceClose = false) => {
    if (isSaving && !forceClose) return;
    setIsModalOpen(false);
    setEditingMaterialId("");
    setFormData(initialForm);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Material name is required.");
      return;
    }

    if (!formData.dome) {
      setError("Please select a dome.");
      return;
    }

    if (formData.price === "" || Number.isNaN(Number(formData.price))) {
      setError("Valid material price is required.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        dome: formData.dome,
        name: formData.name.trim(),
        price: Number(formData.price),
        description: formData.description.trim(),
        isActive: formData.isActive
      };

      if (editingMaterialId) {
        const response = await updateMaterial(editingMaterialId, payload);
        const updatedMaterial = response?.data;
        setMaterials((prev) =>
          prev.map((material) => (material._id === editingMaterialId ? updatedMaterial : material))
        );
        setSuccessMessage("Material updated successfully.");
      } else {
        const response = await createMaterial(payload);
        const createdMaterial = response?.data;
        setMaterials((prev) => [createdMaterial, ...prev]);
        setSuccessMessage("Material created successfully.");
      }

      closeModal(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save material.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (materialId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this material?");
    if (!isConfirmed) return;

    try {
      setDeletingId(materialId);
      setError("");
      await deleteMaterial(materialId);
      setMaterials((prev) => prev.filter((material) => material._id !== materialId));
      setSuccessMessage("Material deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete material.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="admin-fluid-card manage-card">
      <div className="card-header-flex">
        <div>
          <h2 className="card-title">Manage Materials</h2>
          <p className="section-subtext">Configure optional materials for future stall bookings.</p>
        </div>
        <div className="card-header-actions">
          <span className="count-badge">{totalMaterials} Materials</span>
          <button type="button" className="primary-action-btn" onClick={openAddModal}>
            Add Material
          </button>
        </div>
      </div>

      {error && <div className="manage-feedback manage-feedback-error">{error}</div>}
      {successMessage && <div className="manage-feedback manage-feedback-success">{successMessage}</div>}

      <div className="manage-filter-row">
        <div className="input-group manage-dome-select">
          <label>Select Dome</label>
          <select
            value={selectedDomeId}
            onChange={(event) => setSelectedDomeId(event.target.value)}
            disabled={loadingDomes}
          >
            <option value="">{loadingDomes ? "Loading domes..." : "All Domes"}</option>
            {domes.map((dome) => (
              <option key={dome._id} value={dome._id}>
                {dome.domeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dome</th>
              <th>Material Name</th>
              <th>Price</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-table-msg">
                  Loading materials...
                </td>
              </tr>
            ) : filteredMaterials.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table-msg">
                  No materials found for the selected dome.
                </td>
              </tr>
            ) : (
              filteredMaterials.map((material) => (
                <tr key={material._id}>
                  <td>{material.dome?.domeName || "Unassigned"}</td>
                  <td className="font-bold">{material.name}</td>
                  <td>{formatInr(material.price)}</td>
                  <td>{material.description || "No description"}</td>
                  <td>
                    <span className={`status-pill ${material.isActive ? "active" : "inactive"}`}>
                      {material.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="edit-icon-btn" onClick={() => openEditModal(material)}>
                      Edit
                    </button>
                    <button
                      className="edit-icon-btn delete-btn"
                      onClick={() => handleDelete(material._id)}
                      disabled={deletingId === material._id}
                    >
                      {deletingId === material._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card material-modal-card" onClick={(event) => event.stopPropagation()}>
            <h3 className="modal-title">{editingMaterialId ? "Edit Material" : "Add Material"}</h3>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Dome</label>
                <select
                  name="dome"
                  value={formData.dome}
                  onChange={handleChange}
                  required
                  disabled={loadingDomes}
                >
                  <option value="">{loadingDomes ? "Loading domes..." : "Select dome"}</option>
                  {domes.map((dome) => (
                    <option key={dome._id} value={dome._id}>
                      {dome.domeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Material Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter material name"
                  required
                />
              </div>

              <div className="input-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  onWheel={(event) => event.currentTarget.blur()}
                  placeholder="Enter material price"
                  required
                />
              </div>

              <div className="input-group full-span">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add an optional description"
                />
              </div>

              <div className="input-group full-span">
                <label>Status</label>
                <div className="status-toggle-card">
                  <label className="toggle-field">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider" />
                    <span className="toggle-copy">
                      <span className="toggle-title">Material availability</span>
                      <span className={`toggle-label status-pill ${formData.isActive ? "active" : "inactive"}`}>
                        {formData.isActive ? "Active" : "Inactive"}
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-actions full-span">
                <button
                  type="button"
                  className="edit-icon-btn cancel-btn"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="edit-icon-btn save-btn" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingMaterialId ? "Save Changes" : "Add Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMaterials;
