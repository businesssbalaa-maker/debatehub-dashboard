import React, { useEffect, useState } from "react";
import {
  getComingSoonList,
  createComingSoon,
  updateComingSoon,
  deleteComingSoon,
} from "./Api";

const AdminComingSoon = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    description: "",
    comingDateTime: "",
  });

  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const res = await getComingSoonList();
      setItems(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      imageUrl: "",
      title: "",
      description: "",
      comingDateTime: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateComingSoon(editingId, formData);
        alert("Updated Successfully");
      } else {
        await createComingSoon(formData);
        alert("Created Successfully");
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);

    setFormData({
      imageUrl: item.imageUrl,
      title: item.title,
      description: item.description,
      comingDateTime: item.comingDateTime
        ? new Date(item.comingDateTime)
            .toISOString()
            .slice(0, 16)
        : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete?"
    );

    if (!confirmDelete) return;

    try {
      await deleteComingSoon(id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  // Pagination
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentItems = items.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div
      style={{
        width: "100%",
        padding: "24px",
        boxSizing: "border-box",
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Coming Soon Management
        </h1>
      </div>

      {/* Form Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
          }}
        >
          {editingId
            ? "Edit Coming Soon"
            : "Add Coming Soon"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "16px",
            }}
          >
            <input
              type="text"
              name="imageUrl"
              placeholder="Image URL"
              value={formData.imageUrl}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <input
              type="datetime-local"
              name="comingDateTime"
              value={formData.comingDateTime}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            required
            style={{
              ...inputStyle,
              marginTop: "16px",
              resize: "vertical",
            }}
          />

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {editingId ? "Update" : "Create"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
          }}
        >
          Coming Soon List
        </h2>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Coming Date</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item._id}>
                    <td style={tdStyle}>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{
                          width: "80px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
                    </td>

                    <td style={tdStyle}>
                      {item.title}
                    </td>

                    <td style={tdStyle}>
                      {item.description}
                    </td>

                    <td style={tdStyle}>
                      {new Date(
                        item.comingDateTime
                      ).toLocaleString()}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleEdit(item)
                          }
                          style={{
                            background: "#16a34a",
                            color: "#fff",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(item._id)
                          }
                          style={{
                            background: "#dc2626",
                            color: "#fff",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => prev - 1)
              }
              style={paginationBtn}
            >
              Previous
            </button>

            {[...Array(totalPages)].map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setCurrentPage(index + 1)
                  }
                  style={{
                    ...paginationBtn,
                    background:
                      currentPage === index + 1
                        ? "#2563eb"
                        : "#fff",
                    color:
                      currentPage === index + 1
                        ? "#fff"
                        : "#000",
                  }}
                >
                  {index + 1}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
              style={paginationBtn}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "14px",
};

const thStyle = {
  textAlign: "left",
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
  verticalAlign: "top",
};

const paginationBtn = {
  padding: "8px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  background: "#fff",
  cursor: "pointer",
};

export default AdminComingSoon;