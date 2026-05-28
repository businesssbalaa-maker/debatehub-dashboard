import React, { useState, } from "react";
import {
  getAllSubordinateList,
  createSubordinate,
  updateSubordinate,
  deleteSubordinate,
} from "./api";

const SubordinateManager = () => {
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [subordinates, setSubordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [editSubId, setEditSubId] = useState(null);
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const fetchSubordinates = async () => {
    if (!adminPhone || !adminPassword) return alert("Enter admin credentials first");

    setLoading(true);
    setError("");
    try {
      const res = await getAllSubordinateList(adminPhone, adminPassword);
      if (res.success) {
        setSubordinates(res.subordinates);
      } else {
        setError(res.message || "Failed to fetch");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newPhone || !newPassword) return alert("Enter subordinate phone & password");
    try {
      const res = await createSubordinate(adminPhone, adminPassword, newPhone, newPassword);
      if (res.success) {
        alert("Subordinate created");
        setNewPhone("");
        setNewPassword("");
        fetchSubordinates();
      } else {
        alert(res.message || "Failed to create");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleEdit = async (subId) => {
    if (!editPhone && !editPassword) return alert("Enter phone or password to update");
    try {
      const res = await updateSubordinate(subId, adminPhone, adminPassword, editPhone, editPassword);
      if (res.success) {
        alert("Subordinate updated");
        setEditSubId(null);
        setEditPhone("");
        setEditPassword("");
        fetchSubordinates();
      } else {
        alert(res.message || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleDelete = async (subId) => {
    if (!window.confirm("Are you sure you want to delete this subordinate?")) return;
    try {
      const res = await deleteSubordinate(subId, adminPhone, adminPassword);
      if (res.success) {
        alert("Subordinate deleted");
        fetchSubordinates();
      } else {
        alert(res.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="manager-container">
      <style>{`
        .manager-container {
          max-width: 900px;
          margin: 50px auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        h2 {
          text-align: center;
          color: #343a40;
        }
        input, select {
          padding: 10px;
          margin: 5px 0;
          width: 100%;
          border-radius: 6px;
          border: 1px solid #ced4da;
          font-size: 1rem;
        }
        button {
          padding: 10px 15px;
          margin: 5px 5px 15px 0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          background-color: #0d6efd;
          color: white;
          transition: background-color 0.3s;
        }
        button:hover {
          background-color: #0b5ed7;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
        }
        th {
          background-color: #0d6efd;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #e9ecef;
        }
        tr:hover {
          background-color: #dee2e6;
        }
        .action-buttons button {
          margin-right: 5px;
          background-color: #198754;
        }
        .action-buttons button.delete {
          background-color: #dc3545;
        }
        .action-buttons button:hover {
          opacity: 0.9;
        }
      `}</style>

      <h2>Admin Credentials</h2>
      <input type="text" placeholder="Admin Phone" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
      <input type="password" placeholder="Admin Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
      <button onClick={fetchSubordinates}>Fetch Subordinates</button>

      <h2>Create Subordinate</h2>
      <input type="text" placeholder="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
      <input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <button onClick={handleCreate}>Create</button>

      <h2>Subordinate List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Phone</th>
              <th>User Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subordinates.map((sub) => (
              <tr key={sub._id}>
                <td>
                  {editSubId === sub._id ? (
                    <input type="text" value={editPhone} placeholder={sub.phone} onChange={(e) => setEditPhone(e.target.value)} />
                  ) : (
                    sub.phone
                  )}
                </td>
                <td>{sub.userType}</td>
                <td className="action-buttons">
                  {editSubId === sub._id ? (
                    <>
                      <input type="password" placeholder="New Password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
                      <button onClick={() => handleEdit(sub._id)}>Save</button>
                      <button onClick={() => setEditSubId(null)} style={{ backgroundColor: "#6c757d" }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditSubId(sub._id)}>Edit</button>
                      <button className="delete" onClick={() => handleDelete(sub._id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SubordinateManager;
