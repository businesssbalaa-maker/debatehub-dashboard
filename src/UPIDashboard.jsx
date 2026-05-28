import React, { useEffect, useState } from "react";
import { createUPI, getUPIs, updateUPI, deleteUPI } from "./api";
import "./UPIDashboard.css";

export default function UPIDashboard() {
  const [upiList, setUpiList] = useState([]);
  const [formData, setFormData] = useState({ upiId: "", payeeName: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUPIs = async () => {
    try {
      setError("");
      const response = await getUPIs();

      if (response.success && Array.isArray(response.data)) {
        setUpiList(response.data);
      } else {
        setUpiList([]);
        setError(response.message || "Failed to load UPI list");
      }
    } catch (err) {
      console.log(err.response.data);
      setError("Network error");
    }
  };

  useEffect(() => {
    loadUPIs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        // ✅ FIXED: pass object instead of separate args
        const res = await updateUPI(editingId, formData);

        if (!res.success) throw new Error(res.message);
        setMessage("UPI updated successfully");
      } else {
        const res = await createUPI(formData);

        if (!res.success) throw new Error(res.message);
        setMessage("UPI created successfully");
      }

      setFormData({ upiId: "", payeeName: "" });
      setEditingId(null);
      loadUPIs();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  const handleEdit = (item) => {
    setError("");
    setFormData({ upiId: item.upiId, payeeName: item.payeeName });
    setEditingId(item._id); // ✅ USE "_id"
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this UPI?")) return;

    const res = await deleteUPI(id);

    if (res.success) {
      loadUPIs();
    } else {
      setError("Failed to delete UPI");
    }
  };

  return (
    <div className="upi-page-wrapper">
      <h2 className="title">UPI Management</h2>

      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}

      <form onSubmit={handleSubmit} className="form-wrapper">
        <div className="form-group">
          <label>UPI ID</label>
          <input
            type="text"
            name="upiId"
            value={formData.upiId}
            onChange={handleChange}
            placeholder="example@bank"
            required
          />
        </div>

        <div className="form-group">
          <label>Payee Name</label>
          <input
            type="text"
            name="payeeName"
            value={formData.payeeName}
            onChange={handleChange}
            placeholder="Name"
            required
          />
        </div>

        <button disabled={loading} type="submit" className="btn-submit">
          {loading ? "Saving..." : editingId ? "Update UPI" : "Create UPI"}
        </button>
        {editingId && (
          <button
            type="button"
            className="btn-submit"
            onClick={() => {
              setFormData({ upiId: "", payeeName: "" });
              setEditingId(null);
              setMessage("");
              setError("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <h3 className="subtitle">Stored UPI Records</h3>

      <table className="upi-table">
        <thead>
          <tr>
            <th>UPI ID</th>
            <th>Payee Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {upiList.length === 0 ? (
            <tr>
              <td colSpan={3}>No UPI records found</td>
            </tr>
          ) : (
            upiList.map((item) => (
              <tr key={item._id}>
                <td>{item.upiId}</td>
                <td>{item.payeeName}</td>
                <td className="action-cell">
                  <button onClick={() => handleEdit(item)} className="btn-edit">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
