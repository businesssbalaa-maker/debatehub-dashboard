import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Recharge.css";
import { API_BASE_URL } from "./api";

const API_BASE = `${API_BASE_URL}QR`;

function Recharge() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchRecharges = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/recharge-list?page=${pageNumber}&limit=10`);
      if (res.data.success) {
        setRecharges(res.data.data);
        setPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recharge data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecharges();
  }, []);

 



  const filteredRecharges = recharges.filter(
    (r) =>
      r._id.includes(search) ||
      r.userId.includes(search)
       ||
      r.utr.includes(search)
      
  );

  return (
    <div className="recharge-container">
      <h2>Recharge Management</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by mobile or transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="recharge-table">
          <thead>
            <tr>
              <th style={{ background: "#f5f569ff" }}>ID</th>
              <th style={{ background: "#f5f569ff" }}>User ID</th>
              <th style={{ background: "#f5f569ff" }}>Utr</th>
              <th style={{ background: "#f5f569ff" }}>Amount</th>
              <th style={{ background: "#f5f569ff" }}>Date</th>
              <th style={{ background: "#f5f569ff" }}>Status</th>
              
              
            </tr>
          </thead>
          <tbody>
            {filteredRecharges.map((rec) => (
              <tr key={rec._id}>
                <td>{rec._id}</td>
                <td>{rec.userId}</td>
                 <td>{rec.utr || "-"}</td>
                <td>₹{rec.amount}</td>
                <td>{new Date(rec.createdAt).toLocaleString()}</td>
                <td>{rec.approved}</td>
               
                
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button onClick={() => fetchRecharges(page - 1)} disabled={page === 1}>
          Prev
        </button>
        <span>{page} / {totalPages}</span>
        <button onClick={() => fetchRecharges(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Recharge;
