import React, { useState } from "react";
import { FaLock, FaPhone, FaKey } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerUser } from "./api";

const DemoAccounts = () => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    tradePassword: "",
    refCode: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !formData.password || !formData.tradePassword) {
      return toast.error("All fields are required");
    }
    if (formData.phone.length !== 10) {
      return toast.error("Enter a valid 10-digit phone number");
    }
    if (!formData.phone.startsWith("50")) {
      return toast.error("Phone number must start with 50");
    }

    try {
      setLoading(true);
      const res = await registerUser(formData);
      if (res.data.success) {
        toast.success("Registration successful!");
        setFormData({
          phone: "",
          password: "",
          tradePassword: "",
          refCode: "",
        });
        localStorage.setItem("authToken", res.data.token);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
         width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "30px",
          borderRadius: "15px",
          backgroundColor: "#ffffff",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "22px",
            fontWeight: "bold",
            marginBottom: "25px",
            color: "#1e1e1e",
          }}
        >
          Register New User
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Phone */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <FaPhone
              style={{
                position: "absolute",
                top: "50%",
                left: "10px",
                transform: "translateY(-50%)",
                color: "#888",
              }}
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number (must start with 50)"
              style={{
                width: "100%",
                padding: "10px 10px 10px 35px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Login Password */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <FaLock
              style={{
                position: "absolute",
                top: "50%",
                left: "10px",
                transform: "translateY(-50%)",
                color: "#888",
              }}
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Login Password"
              style={{
                width: "100%",
                padding: "10px 10px 10px 35px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Trade Password */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <FaKey
              style={{
                position: "absolute",
                top: "50%",
                left: "10px",
                transform: "translateY(-50%)",
                color: "#888",
              }}
            />
            <input
              type="password"
              name="tradePassword"
              value={formData.tradePassword}
              onChange={handleChange}
              placeholder="Trade Password"
              style={{
                width: "100%",
                padding: "10px 10px 10px 35px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Referral Code (optional) */}
          

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#a5b4fc" : "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              transition: "background 0.3s ease",
              fontSize: "15px",
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Toast container */}
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
    </div>
  );
};

export default DemoAccounts;
