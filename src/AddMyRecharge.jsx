import React, { useState } from "react";

const AddMyRecharge = ({  addrecharge, minusAountAction }) => {
  const [utr, setUtr] = useState("");
  const [phone, setphone] = useState("");
  const [amount, setAmount] = useState("");
  const [minusAmount, setMinusAmount] = useState("");

  // ✅ Add Amount
  const handleAddRecharge = () => {
    if (!utr.trim() ) return alert("UTR is required");
    if (!amount || !phone|| isNaN(amount) || Number(amount) <= 0)
      return alert("Enter a valid amount");

    addrecharge(utr, Number(amount), phone);

    setUtr("");
    setAmount("");
  };

  // ✅ Minus Amount
  const handleMinusAmount = () => {
    if (!minusAmount || !phone|| isNaN(minusAmount) || Number(minusAmount) <= 0)
      return alert("Enter valid minus amount");

    
    minusAountAction(Number(minusAmount), phone);
    setMinusAmount("");
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        
        margin: "auto",
        background: "#fafafa",
      }}
    >
     

      {/* ✅ Add Amount */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px solid #eee",
          borderRadius: "8px",
          background: "#fff",
        }}
      >
        <h4 style={{ marginBottom: "10px" }}>Add Amont in Balance</h4>
 <input
          type="number"
          placeholder="Enter Phone Number"
          value={phone}
          onChange={(e) => setphone(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <input
          type="text"
          placeholder="Enter UTR"
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          required
          onChange={(e) => setAmount(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <button
          onClick={handleAddRecharge}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Submit Add Amount
        </button>
      </div>

      {/* ✅ Minus Amount */}
      <div
        style={{
          marginTop: "25px",
          padding: "15px",
          border: "1px solid #eee",
          borderRadius: "8px",
          background: "#fff",
        }}
      >
        <h4 style={{ marginBottom: "10px" }}>Minus Amont from Balance</h4>
<input
          type="number"
          placeholder="Enter Phone Number"
          value={phone}
          onChange={(e) => setphone(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        <input
          type="number"
          placeholder="Enter Minus Amount"
          value={minusAmount}
          onChange={(e) => setMinusAmount(e.target.value)}
          required
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <button
          onClick={handleMinusAmount}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Submit Minus Amount
        </button>
      </div>
    </div>
  );
};

export default AddMyRecharge;
