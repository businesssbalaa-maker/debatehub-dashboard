import React, { useEffect, useState, useRef } from "react";
import { firestore } from "./firebaseCon";
import { collection, onSnapshot } from "firebase/firestore";
import { createProductAPI, updateProductAPI, deleteProductAPI } from "./api";

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  
  // High-performance tracking
  const intervalsRef = useRef({});
  const lastPricesRef = useRef({});

  const [form, setForm] = useState({
    companyName: "",
    name: "",
    minPrice: "",
    maxPrice: "",
    intervalValue: "",
    intervalUnit: "seconds",
  });

  /* ================= REALTIME DATA SYNC ================= */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "Stock"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    });
    return () => unsubscribe();
  }, []);

  /* ================= MULTITHREADED SIMULATION ENGINE ================= */
  useEffect(() => {
    // 1. Cleanup old intervals to prevent memory leaks
    Object.values(intervalsRef.current).forEach(clearInterval);
    intervalsRef.current = {};

    // 2. Spawn an independent "thread" (interval) for every product
    products.forEach((product) => {
      if (!product.intervalTime) return;

      const runUpdate = () => {
        setProducts((currentProducts) =>
          currentProducts.map((p) => {
            if (p.id !== product.id) return p;

            // Store last price for trend detection
            lastPricesRef.current[p.id] = p.livePrice;

            const range = p.maxPrice - p.minPrice;
            const volatility = 0.02; // 2% max movement
            const change = Math.random() * (range * volatility);
            const direction = Math.random() > 0.45 ? 1 : -1; // Slight upward bias

            let newPrice = p.livePrice + direction * change;
            
            // Boundary Guard
            if (newPrice > p.maxPrice) newPrice = p.maxPrice;
            if (newPrice < p.minPrice) newPrice = p.minPrice;

            return { ...p, livePrice: Number(newPrice.toFixed(2)) };
          })
        );
      };

      // Create the independent interval
      intervalsRef.current[product.id] = setInterval(runUpdate, product.intervalTime);
    });

    return () => Object.values(intervalsRef.current).forEach(clearInterval);
  }, [products.length]); // Re-sync threads only if the product list count changes

  /* ================= HANDLERS ================= */
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ms = form.intervalUnit === "seconds" ? form.intervalValue * 1000 : form.intervalValue * 60000;
    const payload = {
      companyName: form.companyName,
      name: form.name,
      minPrice: Number(form.minPrice),
      maxPrice: Number(form.maxPrice),
      intervalTime: ms,
      livePrice: Number(form.minPrice),
    };

    try {
      editId ? await updateProductAPI(editId, payload) : await createProductAPI(payload);
      setEditId(null);
      setForm({ companyName: "", name: "", minPrice: "", maxPrice: "", intervalValue: "", intervalUnit: "seconds" });
    } catch (err) { console.error(err); }
  };

  const getTrendStyle = (id, currentPrice) => {
    const prev = lastPricesRef.current[id];
    if (!prev || currentPrice === prev) return { color: "#2c3e50", bg: "#f8f9fa" };
    return currentPrice > prev 
      ? { color: "#10b981", bg: "#ecfdf5", icon: "▲" } 
      : { color: "#ef4444", bg: "#fef2f2", icon: "▼" };
  };

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>Stock Engine Terminal</h1>
          <p style={{ margin: "5px 0 0", color: "#64748b" }}>Parallel processing active for {products.length} assets</p>
        </div>
        <div style={statusBadge}><span style={pulseDot}></span> System Live</div>
      </div>

      {/* FORM CARD */}
      <div style={cardStyle}>
        <form onSubmit={handleSubmit} style={formGrid}>
          <div style={inputGroup}><label style={labelStyle}>Company</label><input style={inputStyle} name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Tesla" required /></div>
          <div style={inputGroup}><label style={labelStyle}>Product</label><input style={inputStyle} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Model S" required /></div>
          <div style={inputGroup}><label style={labelStyle}>Min Price</label><input type="number" style={inputStyle} name="minPrice" value={form.minPrice} onChange={handleChange} placeholder="0" required /></div>
          <div style={inputGroup}><label style={labelStyle}>Max Price</label><input type="number" style={inputStyle} name="maxPrice" value={form.maxPrice} onChange={handleChange} placeholder="1000" required /></div>
          <div style={inputGroup}>
            <label style={labelStyle}>Update Every</label>
            <div style={{ display: "flex" }}>
              <input type="number" style={{ ...inputStyle, width: "60px", borderRadius: "6px 0 0 6px" }} name="intervalValue" value={form.intervalValue} onChange={handleChange} required />
              <select name="intervalUnit" style={selectStyle} value={form.intervalUnit} onChange={handleChange}>
                <option value="seconds">Sec</option>
                <option value="minutes">Min</option>
              </select>
            </div>
          </div>
          <button type="submit" style={submitBtn}>{editId ? "Update Thread" : "Add Asset"}</button>
        </form>
      </div>

      {/* TABLE CARD */}
      <div style={{ ...cardStyle, padding: "0" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Asset Name</th>
              <th style={thStyle}>Range</th>
              <th style={thStyle}>Frequency</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Live Quote</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const trend = getTrendStyle(p.id, p.livePrice);
              return (
                <tr key={p.id} style={trStyle}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "600" }}>{p.companyName}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{p.name}</div>
                  </td>
                  <td style={tdStyle}>₹{p.minPrice} - {p.maxPrice}</td>
                  <td style={tdStyle}><span style={tag}>{p.intervalTime / 1000}s</span></td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <span style={{ 
                      color: trend.color, 
                      backgroundColor: trend.bg, 
                      padding: "6px 12px", 
                      borderRadius: "6px", 
                      fontWeight: "bold",
                      transition: "all 0.3s ease",
                      fontFamily: "monospace",
                      fontSize: "16px"
                    }}>
                      {trend.icon} ₹{p.livePrice?.toLocaleString()}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button onClick={() => {setEditId(p.id); setForm({...p, intervalValue: p.intervalTime/1000, intervalUnit: "seconds"})}} style={actionBtn}>Edit</button>
                    <button onClick={() => deleteProductAPI(p.id)} style={{ ...actionBtn, color: "#ef4444" }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }`}</style>
    </div>
  );
};

/* ================= INLINE STYLES ================= */
const containerStyle = { padding: "40px", backgroundColor: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const statusBadge = { backgroundColor: "#fff", padding: "8px 16px", borderRadius: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600" };
const pulseDot = { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981", animation: "pulse 1.5s infinite" };
const cardStyle = { backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "24px", marginBottom: "24px", overflow: "hidden" };
const formGrid = { display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "flex-end" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px", flex: "1 1 180px" };
const labelStyle = { fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" };
const inputStyle = { padding: "10px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", fontSize: "14px" };
const selectStyle = { padding: "10px", border: "1px solid #e2e8f0", borderLeft: "none", borderRadius: "0 6px 6px 0", backgroundColor: "#f8f9fa", cursor: "pointer" };
const submitBtn = { backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", height: "42px" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { backgroundColor: "#f8f9fa", padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" };
const tdStyle = { padding: "16px", borderTop: "1px solid #f1f5f9", fontSize: "14px" };
const trStyle = { transition: "background 0.2s" };
const tag = { backgroundColor: "#e2e8f0", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" };
const actionBtn = { background: "none", border: "none", color: "#2563eb", fontWeight: "600", cursor: "pointer", marginRight: "10px" };

export default ProductTable;