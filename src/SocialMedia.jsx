// SocialMedia.jsx
import React, { useState, useEffect } from "react";
import {
  getSocialLinks,
  createSocialLinks,
  updateSocialLinks,
  deleteSocialLinks,
} from "./api";
import "./SocialMedia.css";

export default function SocialMedia() {
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState({
    telegramUsernameLink: "",
    telegramGroupLink: "",
  });
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch links on load
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const data = await getSocialLinks();
    setLinks(data);
  };

  // ✅ Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateSocialLinks(editingId, form);
    } else {
      await createSocialLinks(form);
    }
    setForm({ telegramUsernameLink: "", telegramGroupLink: "" });
    setEditingId(null);
    fetchLinks();
  };

  // ✅ Edit
  const handleEdit = (link) => {
    setEditingId(link._id);
    setForm({
      telegramUsernameLink: link.telegramUsernameLink,
      telegramGroupLink: link.telegramGroupLink,
    });
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (window.confirm("Delete this link?")) {
      await deleteSocialLinks(id);
      fetchLinks();
    }
  };

  return (
    <div className="social-container">
      <h2>Manage Telegram Links</h2>
      <form className="social-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="telegramUsernameLink"
          placeholder="Telegram Personal Link"
          value={form.telegramUsernameLink}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="telegramGroupLink"
          placeholder="Telegram Group Link"
          value={form.telegramGroupLink}
          onChange={handleChange}
          required
        />
        <button type="submit">
          {editingId ? "Update" : "Add"} Links
        </button>
      </form>

      <div className="social-list">
        {links.length === 0 ? (
          <p>No links found</p>
        ) : (
          links.map((link) => (
            <div key={link._id} className="social-card">
              <p>
                <strong>Personal:</strong>{" "}
                <a href={link.telegramUsernameLink} target="_blank" rel="noreferrer">
                  {link.telegramUsernameLink}
                </a>
              </p>
              <p>
                <strong>Group:</strong>{" "}
                <a href={link.telegramGroupLink} target="_blank" rel="noreferrer">
                  {link.telegramGroupLink}
                </a>
              </p>
              <div className="actions">
                <button onClick={() => handleEdit(link)}>Edit</button>
                <button className="delete" onClick={() => handleDelete(link._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
