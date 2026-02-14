import React, { useEffect, useMemo, useState } from "react";
import { deleteDome, getAllDomes, updateDome } from "../services/adminDomeServices";

const initialEditForm = {
  domeName: "",
  location: "",
  status: "ACTIVE",
  description: "",
  image: ""
};

const ManageDomes = () => {
  const [domes, setDomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDomeId, setEditingDomeId] = useState("");
  const [editForm, setEditForm] = useState(initialEditForm);
  const [isSaving, setIsSaving] = useState(false);

  const totalDomes = useMemo(() => domes.length, [domes.length]);

  const loadDomes = async () => {
    try {
      setLoading(true);
      setError("");
      const domeList = await getAllDomes();
      setDomes(Array.isArray(domeList) ? domeList : []);
    } catch (err) {
      setError(err.message || "Failed to fetch domes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomes();
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleDelete = async (domeId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this dome?");
    if (!isConfirmed) return;

    try {
      setDeletingId(domeId);
      setError("");
      await deleteDome(domeId);
      setDomes((prevDomes) => prevDomes.filter((dome) => dome._id !== domeId));
      setSuccessMessage("Dome deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete dome.");
    } finally {
      setDeletingId("");
    }
  };

  const openEditModal = (dome) => {
    setEditingDomeId(dome._id);
    setEditForm({
      domeName: dome.domeName || "",
      location: dome.location || "",
      status: dome.status || "ACTIVE",
      description: dome.description || "",
      image: dome.image || ""
    });
    setIsEditModalOpen(true);
    setError("");
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setIsEditModalOpen(false);
    setEditingDomeId("");
    setEditForm(initialEditForm);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSave = async (event) => {
    event.preventDefault();

    if (!editForm.domeName.trim() || !editForm.location.trim()) {
      setError("Dome name and location are required.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        domeName: editForm.domeName.trim(),
        location: editForm.location.trim(),
        status: editForm.status,
        description: editForm.description.trim(),
        image: editForm.image.trim()
      };

      const response = await updateDome(editingDomeId, payload);
      const updatedDome = response?.data;

      if (!updatedDome) {
        throw new Error("Invalid response from server.");
      }

      setDomes((prevDomes) =>
        prevDomes.map((dome) => (dome._id === editingDomeId ? updatedDome : dome))
      );
      setSuccessMessage("Dome updated successfully.");
      closeEditModal();
    } catch (err) {
      setError(err.message || "Failed to update dome.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-fluid-card manage-card">
      <div className="card-header-flex">
        <h2 className="card-title">Manage Domes</h2>
        <span className="count-badge">{totalDomes} Domes Total</span>
      </div>

      {error && <div className="manage-feedback manage-feedback-error">{error}</div>}
      {successMessage && <div className="manage-feedback manage-feedback-success">{successMessage}</div>}

      <div className="table-responsive-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="empty-table-msg">
                  Loading domes...
                </td>
              </tr>
            ) : domes.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-table-msg">
                  No domes found.
                </td>
              </tr>
            ) : (
              domes.map((dome) => (
                <tr key={dome._id}>
                  <td className="font-bold">{dome.domeName}</td>
                  <td>{dome.location}</td>
                  <td>
                    <span className={`status-pill ${(dome.status || "").toLowerCase()}`}>
                      {dome.status || "N/A"}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button className="edit-icon-btn" onClick={() => openEditModal(dome)}>
                      Edit
                    </button>
                    <button
                      className="edit-icon-btn delete-btn"
                      onClick={() => handleDelete(dome._id)}
                      disabled={deletingId === dome._id}
                    >
                      {deletingId === dome._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={closeEditModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <h3 className="modal-title">Edit Dome</h3>
            <form className="form-grid" onSubmit={handleEditSave}>
              <div className="input-group">
                <label>Dome Name</label>
                <input
                  type="text"
                  name="domeName"
                  value={editForm.domeName}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Status</label>
                <select name="status" value={editForm.status} onChange={handleEditChange}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="input-group">
                <label>Dome Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={editForm.image}
                  onChange={handleEditChange}
                />
              </div>

              <div className="input-group full-span">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={editForm.description}
                  onChange={handleEditChange}
                />
              </div>

              <div className="modal-actions full-span">
                <button
                  type="button"
                  className="edit-icon-btn cancel-btn"
                  onClick={closeEditModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="edit-icon-btn save-btn" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDomes;
