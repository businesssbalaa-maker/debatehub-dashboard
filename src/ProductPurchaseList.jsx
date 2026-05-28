import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProductPurchaseList.css"; // make sure this file exists
import { API_BASE_URL } from "./api";

const API_BASE = `${API_BASE_URL}QR`;

const ProductPurchaseList = () => {
  const [stats, setStats] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${API_BASE}/transaction-stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchPurchases = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/product-purchase-list`, {
        params: { page, limit: 10 },
      });
      setPurchases(res.data.data);
      setPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPurchases(page);
  }, [page]);

  const handleRefreshStats = () => {
    fetchStats();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchPurchases(newPage);
    }
  };

  return (
    <div className="container">
      <h1>Product Purchases</h1>

      {/* --- Stats Cards --- */}
      {stats && (
        <div className="stats-cards">
          <div className="card">
            <h3>Approved Withdraw</h3>
            <p>Amount: ₹{stats.withdrawStats.TotalwithdrawPassamount}</p>
            <p>Cases: {stats.withdrawStats.TotalwithdrawPassacase}</p>
          </div>
          <div className="card">
            <h3>Rejected Withdraw</h3>
            <p>Amount: ₹{stats.withdrawStats.totalrejectamount}</p>
            <p>Cases: {stats.withdrawStats.totalrejectcase}</p>
          </div>
          <div className="card">
            <h3>Pending Withdraw</h3>
            <p>Amount: ₹{stats.withdrawStats.pendingWithdrawAmount}</p>
            <p>Cases: {stats.withdrawStats.pendingWithdrawCases}</p>
          </div>
          <div className="card">
            <h3>Approved Recharge</h3>
            <p>Amount: ₹{stats.rechargeStats.totalRechargeApprovedAmount}</p>
            <p>Cases: {stats.rechargeStats.totalRechargeApprovedCases}</p>
          </div>
          <div className="card">
            <h3>Pending Recharge</h3>
            <p>Amount: ₹{stats.rechargeStats.totalRechargePendingAmount}</p>
            <p>Cases: {stats.rechargeStats.totalRechargePendingCases}</p>
          </div>
          <div className="card">
            <h3>Reject Recharge</h3>
            <p>Amount: ₹{stats.rechargeStats.totalRechargeRejectedAmount}</p>
            <p>Cases: {stats.rechargeStats.totalRechargeRejectedCases}</p>
          </div>
        </div>
      )}

      {/* Refresh Stats Button */}
      <button
        className={`refresh-btn ${refreshing ? "loading" : ""}`}
        onClick={handleRefreshStats}
        disabled={refreshing}
      >
        {refreshing ? "Refreshing..." : "Refresh Stats"}
      </button>

      {/* --- Purchases Table --- */}
      <table className="purchase-table">
        <thead>
          <tr>
            <th>#</th>
            <th>User ID</th>
            <th>Product</th>
            <th>Amount</th>
            <th>Total Amount</th>
            <th>Quantity</th>
            <th>cycle Duration</th>
            <th>cycle Type</th>
            <th>daily Income</th>
            <th>Type</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="loading-text">
                Loading purchases...
              </td>
            </tr>
          ) : purchases.length === 0 ? (
            <tr>
              <td colSpan="8">No purchases found.</td>
            </tr>
          ) : (
            purchases.map((p, index) => (
              <tr key={p._id}>
                <td>{index + 1 + (page - 1) * 10}</td>
                <td>{p.userId}</td>
                <td>{p.productName}</td>
                <td>₹{p.amount}</td>
                <td>₹{p.TotalAmount}</td>
                <td>{p.quantity}</td>
                <td>{p.cycleDuration}</td>
                <td>{p.cycleType}</td>
                <td>{p.dailyIncome}</td>

                <td>{p.purchaseType}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* --- Pagination Controls --- */}
      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductPurchaseList;
