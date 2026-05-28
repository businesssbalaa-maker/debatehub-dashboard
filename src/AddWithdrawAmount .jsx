import React, { useState } from "react";
import { FaPlusCircle, FaMinusCircle, FaPhoneAlt, FaRupeeSign } from "react-icons/fa";
import { addWithdrawAmountMenually } from "./api"; // adjust path

const AddWithdrawAmount = () => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!phone || phone.length < 10) {
      alert("Enter valid phone number");
      return false;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Enter valid amount");
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setLoading(true);

    const res = await addWithdrawAmountMenually(phone, Number(amount), "add");

    setLoading(false);
    alert(res.message);
    if (res.success) setAmount("");
  };

  const handleMinus = async () => {
    if (!validate()) return;
    setLoading(true);

    const res = await addWithdrawAmountMenually(phone, Number(amount), "minus");

    setLoading(false);
    alert(res.message);
    if (res.success) setAmount("");
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Withdrawal Amount Control</h3>

      {/* Phone */}
      <div style={styles.inputBox}>
        <FaPhoneAlt style={styles.icon} />
        <input
          type="number"
          placeholder="User Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Amount */}
      <div style={styles.inputBox}>
        <FaRupeeSign style={styles.icon} />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Buttons */}
      <button
        onClick={handleAdd}
        disabled={loading}
        style={{ ...styles.button, background: "#28a745" }}
      >
        <FaPlusCircle /> Add Withdrawal
      </button>

      <button
        onClick={handleMinus}
        disabled={loading}
        style={{ ...styles.button, background: "#dc3545" }}
      >
        <FaMinusCircle /> Minus Withdrawal
      </button>
    </div>
  );
};

export default AddWithdrawAmount;


const styles = {
  container: {
   
    margin: "auto",
    marginTop: 20,
   
    padding: 20,
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
  },
  heading: {
    textAlign: "center",
    marginBottom: 20,
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: "0 10px",
    marginBottom: 12,
  },
  icon: {
    color: "#555",
    marginRight: 8,
  },
  input: {
    width: "100%",
    padding: 10,
    border: "none",
    outline: "none",
    fontSize: 15,
  },
  button: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
};
