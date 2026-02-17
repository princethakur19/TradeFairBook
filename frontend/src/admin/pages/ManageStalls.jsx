import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const ManageStalls = () => {
  const [stallsData, setStallsData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    price: "",
    status: "AVAILABLE",
  });

  // =============================
  // Fetch stalls
  // =============================
  const fetchStalls = async () => {
    try {
      const res = await api.get("/stalls");
      setStallsData(res.data.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStalls();
  }, []);

  // =============================
  // Start Edit
  // =============================
  const startEdit = (stall) => {
    setEditingId(stall._id);
    setEditForm({
      price: stall.price,
      status: stall.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // =============================
  // Save Edit
  // =============================
  const saveEdit = async (id) => {
    try {
      await api.put(`/stalls/${id}`, {
        price: Number(editForm.price),
        status: editForm.status,
      });

      setEditingId(null);
      fetchStalls();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // =============================
  // Delete
  // =============================
  const deleteStall = async (id) => {
    if (!window.confirm("Delete this stall?")) return;

    try {
      await api.delete(`/stalls/${id}`);
      fetchStalls();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="admin-fluid-card manage-card">
      <div className="card-header-flex">
        <h2 className="card-title">Manage Stalls</h2>
        <span className="count-badge">
          {stallsData.length} Stalls Total
        </span>
      </div>

      <div className="table-responsive-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>STALL</th>
              <th>DOME</th>
              <th>SIDE</th>
              <th>PRICE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {stallsData.map((stall) => (
              <tr key={stall._id}>
                <td className="font-bold">{stall.stallNumber}</td>
                <td>{stall.dome?.domeName || "N/A"}</td>
                <td>{stall.side}</td>

                {/* PRICE */}
                <td>
                  {editingId === stall._id ? (
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          price: e.target.value,
                        })
                      }
                      className="table-input"
                    />
                  ) : (
                    `₹${stall.price}`
                  )}
                </td>

                {/* STATUS */}
                <td>
                  {editingId === stall._id ? (
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          status: e.target.value,
                        })
                      }
                      className="table-select"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BOOKED">BOOKED</option>
                    </select>
                  ) : (
                    <span
                      className={`status-pill ${stall.status.toLowerCase()}`}
                    >
                      {stall.status}
                    </span>
                  )}
                </td>

                {/* ACTION */}
                <td>
                  <div className="action-buttons">
                    {editingId === stall._id ? (
                      <>
                        <button
                          className="edit-icon-btn save-btn"
                          onClick={() => saveEdit(stall._id)}
                        >
                          Save
                        </button>
                        <button
                          className="edit-icon-btn cancel-btn"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="edit-icon-btn"
                          onClick={() => startEdit(stall)}
                        >
                          Edit
                        </button>
                        <button
                          className="edit-icon-btn delete-btn"
                          onClick={() => deleteStall(stall._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStalls;
