import React, { useEffect, useState } from "react";
import { addRechargeApi, getCommission, minusAmountApi, updateCommission } from "./api";
import AddMyRecharge from "./AddMyRecharge";
import AddWithdrawAmount from "./AddWithdrawAmount ";

const CommissionSettings = () => {
  const [level1, setLevel1] = useState("");
  const [level2, setLevel2] = useState("");
  const [level3, setLevel3] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch values on load
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCommission();
      setLevel1(res.data.level1);
      setLevel2(res.data.level2 );
      setLevel3(res.data.level3);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Update function
  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateCommission({ level1, level2, level3 });
      alert("Commission Updated Successfully!");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div  style={{
        padding: "20px",
        border: "2px solid #ddd",
        borderRadius: "12px",
        marginTop: "20px",
        width: "100%",
        overflow:"scroll",
          marginLeft: "auto",
        marginRight: "auto",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
       
      }}>

     <div
      style={{
        padding: "20px",
        border: "2px solid #ddd",
        borderRadius: "12px",
        marginTop: "20px",
       
      marginBottom:"20px",
        marginLeft: "auto",
        marginRight: "auto",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          color: "#333",
        }}
      >
        Commission Settings
      </h2>

      {/* Inputs */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
          Level 1 (%)
        </label>
        <input
          type="number"
          value={level1}
          onChange={(e) => setLevel1(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
          Level 2 (%)
        </label>
        <input
          type="number"
          value={level2}
          onChange={(e) => setLevel2(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
          Level 3 (%)
        </label>
        <input
          type="number"
          value={level3}
          onChange={(e) => setLevel3(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={handleUpdate}
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
            marginRight: "10px",
          }}
        >
          {loading ? "Updating..." : "Update"}
        </button>

        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          Refresh
        </button>
      </div>
    </div> 

     <AddMyRecharge
          
          
          addrecharge={async (utr, amt, phone) => {
            try {
              const res = await addRechargeApi(utr, amt, phone);
              console.log(res.data);
              alert(res.data.message || "Amount added successfully");
              
            
            } catch (err) {
              console.log(err.response?.data.err);
              alert(err.response?.data?.message || "Failed to add amount");
            }
          }}
          minusAountAction={async (amt, phone) => {
            try { 
              const res = await minusAmountApi(amt, phone);
              console.log(res.data.balance);
              alert(res.data.message || "Amount deducted successfully");
                
            } catch (err) {
              console.log(err.response?.data);
              alert(err.response?.data?.error || "Failed to deduct amount");
            }
          }}
        />
        <AddWithdrawAmount/>
    </div>
    
  );
};

export default CommissionSettings;
