import React, { useState, useEffect } from "react";
import { RefreshCw, Clock } from "lucide-react";
import "./WithdrawHistory.css";
import { API_BASE_URL } from "./api";

const API_WITHDRAW_STATEMENT = `${API_BASE_URL}api/withdraw/withdraw-statement`;

const WithdrawStatement = () => {
  const [withdraws, setWithdraws] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchWithdraws = async (pageNum = 1) => {
    setLoading(true);
    setMessage("Fetching withdrawals...");
    try {
      const res = await fetch(`${API_WITHDRAW_STATEMENT}?page=${pageNum}&limit=10`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch withdrawals");

      setWithdraws(data.history || []);
      setPage(data.page);
      setTotalPages(data.totalPages || 1);
      setMessage(`Page ${data.page} of ${data.totalPages}`);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdraws(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div className="page-header">
          <h1>
             Withdraw History
          </h1>
          <button
            className="fetch-btn"
            onClick={() => fetchWithdraws(page)}
            disabled={loading}
          >
            <RefreshCw className={`icon ${loading ? "spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {message && <div className="msg-box info">{message}</div>}

        <table className="withdraw-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading...</td>
              </tr>
            ) : withdraws.length === 0 ? (
              <tr>
                <td colSpan="6">No withdrawals found.</td>
              </tr>
            ) : (
              withdraws.map((item, index) => (
                <tr key={item._id}>
                  <td>{(page - 1) * 10 + index + 1}</td>
                  <td>{item.user}</td>
                  <td>₹{item.amount}</td>
                  <td
                    className={`status ${item.status}`}
                    style={{
                      color:
                        item.status === "approved"
                          ? "green"
                          : item.status === "rejected"
                          ? "red"
                          : "#eab308",
                      fontWeight: "bold",
                    }}
                  >
                    {item.status.toUpperCase()}
                  </td>
                  <td>
                    <Clock className="icon" />{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td>{new Date(item.updatedAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="pagination">
          <button onClick={handlePrev} disabled={page === 1}>
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button onClick={handleNext} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawStatement;
