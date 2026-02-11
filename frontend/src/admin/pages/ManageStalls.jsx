import React from 'react';

const ManageStalls = ({ stallsData, setStallsData }) => {
  const [editingId, setEditingId] = React.useState(null);
  const [editForm, setEditForm] = React.useState({ price: '', status: 'AVAILABLE' });

  const startEdit = (stall) => {
    setEditingId(stall.id);
    setEditForm({ price: stall.price, status: stall.status });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ price: '', status: 'AVAILABLE' });
  };

  const saveEdit = (stallId) => {
    const parsedPrice = Number.parseInt(editForm.price, 10);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      alert('Please enter a valid stall price.');
      return;
    }

    const updated = stallsData.map((stall) =>
      stall.id === stallId ? { ...stall, price: parsedPrice, status: editForm.status } : stall
    );

    setStallsData(updated);
    cancelEdit();
  };

  return (
    <div className="admin-fluid-card manage-card">
      <div className="card-header-flex">
        <h2 className="card-title">Manage Stalls</h2>
        <span className="count-badge">{stallsData.length} Stalls Total</span>
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
            {stallsData.length > 0 ? (
              stallsData.map((stall) => (
                <tr key={stall.id}>
                  <td className="font-bold">{stall.id}</td>
                  <td>{stall.dome}</td>
                  <td>{stall.side}</td>
                  <td>
                    {editingId === stall.id ? (
                      <input
                        type="number"
                        min="0"
                        className="table-input"
                        value={editForm.price}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                      />
                    ) : (
                      stall.price
                    )}
                  </td>
                  <td>
                    {editingId === stall.id ? (
                      <select
                        className="table-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="BOOKED">BOOKED</option>
                        <option value="HOLD">HOLD</option>
                        <option value="BLOCKED">BLOCKED</option>
                      </select>
                    ) : (
                      <span className={`status-pill ${stall.status.toLowerCase()}`}>{stall.status}</span>
                    )}
                  </td>
                  <td className="action-cell">
                    {editingId === stall.id ? (
                      <>
                        <button className="edit-icon-btn save-btn" onClick={() => saveEdit(stall.id)}>Save</button>
                        <button className="edit-icon-btn cancel-btn" onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <button className="edit-icon-btn" onClick={() => startEdit(stall)}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-table-msg">
                  No stalls found. Please generate a layout in the <b>Stall Layout</b> tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStalls;
