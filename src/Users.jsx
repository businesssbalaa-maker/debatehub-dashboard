/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronsRight,
  Loader,
  ShoppingCart,
  Users,
  DollarSign,
  X,
  Check,
  Trash2,
} from "lucide-react";

// Centralized API integration hooks cleanly imported
import { 
  API_BASE_URL, 
  deleteUser, 
  searchuser,
  getAllUsersAPI,
  getSingleUserDetailAPI
} from "./api";

import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

// --- HELPER FUNCTIONS ---
const formatDate = (dateObj) => {
  if (!dateObj) return "N/A";
  const isoString = typeof dateObj === "object" && dateObj.$date ? dateObj.$date : dateObj;
  const date = new Date(isoString);
  if (isNaN(date)) return "N/A";

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatOid = (idObj) => (idObj ? idObj["$oid"] || idObj : "N/A");

// --- REUSABLE COMPONENT FOR SERVER-SIDE PAGINATION TABLE ---
const TableWithServerPagination = ({
  isDemoUser,
  data,
  children,
  renderRow,
  emptyMessage,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading,
}) => {
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const totalDisplay = data ? data.length : 0;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const PaginationControls = () => (
    <div className="p-controls">
      <span className="p-info">
        Showing <span style={{ fontWeight: 600 }}>{totalDisplay > 0 ? startIndex + 1 : 0}</span> to{" "}
        <span style={{ fontWeight: 600 }}>{Math.min(startIndex + totalDisplay, totalItems)}</span> of{" "}
        <span style={{ fontWeight: 600 }}>{totalItems}</span> entries
      </span>
      <div className="p-btns">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1 || loading} className="p-btn">
          Prev
        </button>
        <span className="p-indicator">{currentPage} / {totalPages}</span>
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || loading} className="p-btn">
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="table-wrap">
      {loading ? (
        <div className="loader-box">
          <Loader className="animate-spin text-indigo-500" size={32} />
          <p>Processing Cluster Sync...</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
          <table className="table-base">
            {children}
            <tbody>
              {data && data.length > 0 ? (
                data.map((item, index) => {
                  if (isDemoUser) {
                    if (item?.phone == null || item?.phone?.startsWith("50")) {
                      return renderRow(item, startIndex + index);
                    }
                    return null;
                  } else {
                    if (!item?.phone?.startsWith("50")) {
                      return renderRow(item, startIndex + index);
                    }
                    return null;
                  }
                })
              ) : (
                <tr>
                  <td colSpan={100} className="td text-center py-8">
                    <p className="empty-msg-inline">{emptyMessage}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {totalItems > PAGE_SIZE && <PaginationControls />}
    </div>
  );
};

// --- WITHDRAW LIMIT UPDATE COMPONENT ---
const WithdrawLimitUpdater = ({ userId, currentLimit, onUpdate }) => {
  const [limit, setLimit] = useState(currentLimit);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch(`${API_BASE_URL}api/users/${userId}/withdraw-limit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: parseFloat(limit) }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("success");
        onUpdate(data.withdrawLimit);
      } else {
        throw new Error(data.message || "Failed to update limit.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="limit-update-form">
      <h4 className="h4-title">Update Withdrawal Limit</h4>
      <div className="input-group">
        <input
          type="number" step="0.01" value={limit}
          onChange={(e) => setLimit(e.target.value)} required
          className="input-field" disabled={status === "loading"}
        />
        <button type="submit" className="btn-update" disabled={status === "loading"} style={{ whiteSpace: "nowrap" }}>
          {status === "loading" ? <Loader className="animate-spin" size={16} /> : "Set Limit"}
        </button>
      </div>
      {status === "success" && <p className="status-msg success-msg"><Check size={16} /> Limit updated successfully!</p>}
      {status === "error" && <p className="status-msg error-msg"><X size={16} /> Failed to update limit.</p>}
    </form>
  );
};

// --- FULLSCREEN SLIDEOUT DRAWER FOR USER DETAILS ---
const UserDetailsModal = ({ selectedUserFromList, onClose, isDemoUser }) => {
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [withdrawLimit, setWithdrawLimit] = useState(0);

  useEffect(() => {
    async function loadFullUserDetails() {
      try {
        setLoadingDetails(true);
        const result = await getSingleUserDetailAPI(formatOid(selectedUserFromList._id));
        if (result.success && result.user) {
          setUserDetail(result.user);
          setWithdrawLimit(result.user.withdrawLimit || 0);
        }
      } catch (err) {
        console.error("Failed to load user profile details:", err);
      } finally {
        setLoadingDetails(false);
      }
    }
    if (selectedUserFromList) loadFullUserDetails();
  }, [selectedUserFromList]);

  if (!selectedUserFromList) return null;

  const activeUser = userDetail || selectedUserFromList;

  const totalPurchased = activeUser.purchasedQuestions?.length || 0;
  const winCount = activeUser.purchasedQuestions?.filter(q => q.winningStatus === "win").length || 0;
  const lossCount = activeUser.purchasedQuestions?.filter(q => q.winningStatus === "loss").length || 0;
  const pendingCount = activeUser.purchasedQuestions?.filter(q => q.winningStatus === "pending").length || 0;

  const DetailItem = ({ label, value }) => (
    <div className="d-item">
      <p className="d-item-label">{label}</p>
      <p className="d-item-value">{value || "—"}</p>
    </div>
  );

  return (
    <div className="fullscreen-details-overlay">
      <div className="fullscreen-details-drawer">
        
        <button className="drawer-dismiss-cut-btn" onClick={onClose} aria-label="Close details window">
          <X size={24} />
        </button>

        {loadingDetails ? (
          <div className="drawer-loader-centered">
            <Loader className="animate-spin text-indigo-600" size={48} />
            <p>Gathering profile nodes...</p>
          </div>
        ) : (
          <div className="drawer-scrollable-content">
            <h2 className="drawer-main-title">OID: {formatOid(activeUser._id)}</h2>
            <p className="drawer-subtitle">Node: {activeUser.phone}</p>

            {/* FINANCIAL OVERVIEW PILLS */}
            <div className="card-grid-4">
              <div className="d-card">
                <div className="d-card-icon-wrap" style={{color: "#10b981", backgroundColor: "rgba(16,185,129,0.1)"}}><DollarSign size={20}/></div>
                <div><p className="d-card-title">Balance</p><p className="d-card-value">₹{activeUser.balance}</p></div>
              </div>
              <div className="d-card">
                <div className="d-card-icon-wrap" style={{color: "#4f46e5", backgroundColor: "rgba(79,70,229,0.1)"}}><ShoppingCart size={20}/></div>
                <div><p className="d-card-title">Invested</p><p className="d-card-value">₹{activeUser.totalBuy}</p></div>
              </div>
              <div className="d-card">
                <div className="d-card-icon-wrap" style={{color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)"}}><DollarSign size={20}/></div>
                <div><p className="d-card-title">Limit</p><p className="d-card-value">₹{withdrawLimit}</p></div>
              </div>
            </div>

            {/* Q&A QUANTITY METRICS */}
            <div className="section-box">
              <h3 className="h2-section"><ShoppingCart size={20} style={{marginRight: 8}} /> Q&A Metrics</h3>
              <div className="info-grid text-dense-grid">
                <div className="d-item" style={{borderLeft: "4px solid #4f46e5"}}><p className="d-item-label">Total Pools</p><p className="d-item-value" style={{color: "#4f46e5", fontSize: "1.15rem", fontWeight: "800"}}>{totalPurchased}</p></div>
                <div className="d-item" style={{borderLeft: "4px solid #10b981"}}><p className="d-item-label">Wins</p><p className="d-item-value" style={{color: "#10b981", fontSize: "1.15rem", fontWeight: "800"}}>{winCount}</p></div>
                <div className="d-item" style={{borderLeft: "4px solid #ef4444"}}><p className="d-item-label">Losses</p><p className="d-item-value" style={{color: "#ef4444", fontSize: "1.15rem", fontWeight: "800"}}>{lossCount}</p></div>
                <div className="d-item" style={{borderLeft: "4px solid #f59e0b"}}><p className="d-item-label">Pending</p><p className="d-item-value" style={{color: "#f59e0b", fontSize: "1.15rem", fontWeight: "800"}}>{pendingCount}</p></div>
              </div>
            </div>

            {/* CORE METADATA */}
            <div className="section-box">
              <h3 className="h2-section"><Users size={20} style={{marginRight: 8}} /> Identity Profile</h3>
              <div className="info-grid">
                <DetailItem label="Phone Node" value={activeUser.phone} />
                <DetailItem label="Password" value={activeUser.password} />
                <DetailItem label="Trade Key" value={activeUser.tradePassword} />
                <DetailItem label="Referral Signature" value={activeUser.referralCode} />
                <DetailItem 
                  label="Affiliate Parent" 
                  value={
                    activeUser.referredBy?.phone 
                      ? `${activeUser.referredBy.phone} (${activeUser.referredBy.refCode || "No Code"})`
                      : "None"
                  } 
                />
                <DetailItem label="Product Earnings" value={`₹${activeUser.productIncome || 0}`} />
              </div>

              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #e2e8f0" }}>
                <WithdrawLimitUpdater 
                  userId={formatOid(activeUser._id)} currentLimit={withdrawLimit}
                  onUpdate={(newLimit) => setWithdrawLimit(newLimit)}
                />
              </div>
            </div>

            {/* BANK DETAILS */}
            <div className="section-box">
              <h3 className="h2-section"><Check size={20} style={{marginRight: 8}} /> Settlement Bank Details</h3>
              <div className="info-grid">
                <DetailItem label="Holder Name" value={activeUser.bankDetails?.holderName} />
                <DetailItem label="Account Number" value={activeUser.bankDetails?.accountNumber} />
                <DetailItem label="Bank Name" value={activeUser.bankDetails?.bankName} />
                <DetailItem label="IFSC Code" value={activeUser.bankDetails?.ifscCode} />
                <DetailItem label="UPI String" value={activeUser.bankDetails?.upiId} />
              </div>
            </div>

            {/* RECHARGE & WITHDRAW HISTORY FLOW */}
            <div className="section-box">
              <h3 className="h2-section"><DollarSign size={20} style={{marginRight: 8}} /> Gateways Financial History</h3>
              <div className="history-grid-split">
                
                {/* Recharge */}
                <div className="gateway-history-card">
                  <h4>Deposits ({activeUser.rechargeHistory?.length || 0})</h4>
                  {activeUser.rechargeHistory && activeUser.rechargeHistory.length > 0 ? (
                    <div className="gateway-list-scroll">
                      {activeUser.rechargeHistory.map((rec, i) => (
                        <div key={i} className="gateway-history-row">
                          <span className="t-green font-semibold">₹{rec.amount}</span>
                          <span className="text-xs text-muted">{formatDate(rec.date)}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted">No deposits processed.</p>}
                </div>

                {/* Withdraw */}
                <div className="gateway-history-card">
                  <h4>Withdrawals ({activeUser.withdrawHistory?.length || 0})</h4>
                  {activeUser.withdrawHistory && activeUser.withdrawHistory.length > 0 ? (
                    <div className="gateway-list-scroll">
                      {activeUser.withdrawHistory.map((wit, i) => (
                        <div key={i} className="gateway-history-row">
                          <span className="text-danger font-semibold">₹{wit.amount}</span>
                          <span className="text-xs text-muted">{formatDate(wit.date)}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-muted">No withdrawals cleared.</p>}
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

// --- MAIN ALL USERS ROOT FLOOR ---
const AllUsers = ({ isDemoUser }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [paginationMeta, setPaginationMeta] = useState({ totalPages: 1, totalItems: 0 });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const syncMasterUserCollection = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await getAllUsersAPI(currentPage, PAGE_SIZE);
      if (res.success && res.users) {
        setUsers(res.users);
        setPaginationMeta({
          totalPages: res.totalPages || 1,
          totalItems: res.total || 0
        });
      } else {
        setErrorMessage(res.message || "Failed to parse system log parameters.");
      }
    } catch (err) {
      console.error("Master telemetry mapping route error:", err);
      setErrorMessage("System failed to gather user logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncMasterUserCollection();
  }, [currentPage]);

  const handleDelete = async (e, userId, phone) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete profile ${phone}?`)) return;

    try {
      const response = await deleteUser(userId);
      if (response?.success || response?.status === 200) {
        alert(response.message || "User erased safely.");
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        if (searchResult) setSearchResult((prev) => prev?.filter((u) => u._id !== userId));
      } else {
        alert(response?.message || "Delete sequence rejected by master node filters.");
      }
    } catch (err) {
      console.error("Erase sequence violation:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResult(null);
      return;
    }

    const localUser = users.find((u) => u.phone === searchTerm || formatOid(u._id) === searchTerm);
    if (localUser) {
      setSearchResult([localUser]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await searchuser(searchTerm);
      if (res.data?.user && res.data.user.length > 0) {
        setSearchResult(res.data.user);
      } else {
        setSearchResult([]);
      }
    } catch (err) {
      console.error("Telemetry query lookup mismatch fault:", err);
      setSearchResult([]);
    } finally {
      setIsSearching(false);
    }
  };

  const renderUserRow = (user, index) => (
    <tr key={formatOid(user._id)} className="tr-hover-user" onClick={() => setSelectedUser(user)}>
      <td className="td">{index + 1}</td>
      <td className="td t-indigo font-semibold">{user.phone}</td>
      <td className="td text-xs">{formatOid(user._id)}</td>
      <td className="td t-green font-medium">₹{user.balance}</td>
      <td className="td">₹{user.totalBuy}</td>
      <td className="td">{user.referralCode}</td>
      <td className="td">
        <button className="btn-delete" onClick={(e) => handleDelete(e, user._id, user.phone)}>
          <Trash2 style={{ width: 16, height: 16, color: "red" }} />
        </button>
      </td>
      <td className="td">
        <button className="btn-view" aria-label="View properties drawer">
          <ChevronsRight style={{ width: 16, height: 16 }} />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="allUser">
      <style>
        {`
          .allUser { min-height: 100vh; background-color: #f3f4f6; font-family: 'Inter', sans-serif; width: 100%; position: relative; }
          .list-view { padding: 16px; }
          @media (min-width: 768px) { .list-view { padding: 32px; } }
          
          .h1-main { font-size: 1.5rem; font-weight: 800; margin-bottom: 20px; color: #4338ca; display: flex; align-items: center; }
          @media (min-width: 768px) { .h1-main { font-size: 1.875rem; margin-bottom: 24px; } }

          .search-bar { display: flex; gap: 8px; margin-bottom: 20px; width: 100%; max-width: 480px; }
          .input-search { flex-grow: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.875rem; width: 100%; }
          .btn-search { background-color: #4338ca; color: #ffffff; padding: 10px 16px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.875rem; }
          
          .table-wrap { border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); background-color: #ffffff; display: flex; flex-direction: column; width: 100%; }
          .table-base { min-width: 100%; border-collapse: collapse; width: 100%; }
          .th { padding: 12px 14px; text-align: left; font-size: 0.75rem; font-weight: 700; color: #4b5563; text-transform: uppercase; background-color: #eef2ff; white-space: nowrap; }
          .td { padding: 12px 14px; font-size: 0.875rem; color: #1f2937; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
          .tr-hover-user:hover { background-color: #f8fafc; cursor: pointer; }
          .btn-delete { background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; }
          .btn-view { padding: 6px; background-color: #6366f1; color: #ffffff; border-radius: 50%; border: none; cursor: pointer; display: flex; }

          .p-controls { display: flex; flex-direction: column; gap: 10px; justify-content: space-between; align-items: center; padding: 14px 20px; background-color: #eef2ff; border-top: 1px solid #c7d2fe; }
          @media (min-width: 480px) { .p-controls { flex-direction: row; gap: 0; } }
          .p-info { font-size: 0.8125rem; color: #4b5563; }
          .p-btns { display: flex; gap: 8px; align-items: center; }
          .p-btn { padding: 6px 12px; font-size: 0.8125rem; font-weight: 500; border-radius: 6px; color: #4f46e5; background-color: #ffffff; border: 1px solid #a5b4fc; cursor: pointer; }
          .p-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .p-indicator { padding: 6px 12px; font-size: 0.8125rem; font-weight: 600; color: #3730a3; }

          /* 📱 ULTRA-RESPONSIVE FULL-SCREEN OVERLAY DRAWER PLATFORM COMPOSITIONS */
          .fullscreen-details-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
            z-index: 99999; display: flex; justify-content: flex-end;
          }
          
          .fullscreen-details-drawer {
            width: 100%; background-color: #ffffff; height: 85vh;
            margin-top: auto; border-radius: 1.5rem 1.5rem 0 0;
            box-shadow: 0 -10px 25px rgba(0,0,0,0.1); padding: 1.5rem; position: relative;
            display: flex; flex-direction: column; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

          @media (min-width: 768px) {
            .fullscreen-details-drawer {
              max-width: 50rem; height: 100vh; margin-top: 0; border-radius: 0;
              box-shadow: -15px 0 35px rgba(0,0,0,0.1); padding: 3rem;
              animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
          }
          @media (min-width: 1200px) { .fullscreen-details-drawer { max-width: 65rem; } }
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          
          .drawer-dismiss-cut-btn {
            position: absolute; top: 1.25rem; right: 1.25rem; background: #f1f5f9; border: none;
            color: #64748b; cursor: pointer; transition: all 0.15s; padding: 0.5rem; border-radius: 50%;
          }
          .drawer-dismiss-cut-btn:hover { color: #0f172a; background: #e2e8f0; }
          @media (min-width: 768px) { .drawer-dismiss-cut-btn { top: 1rem; right: 1rem; background: none; } }

          .drawer-scrollable-content { overflow-y: auto; flex-grow: 1; padding-right: 4px; text-align: left; }
          .drawer-main-title { font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem 0; word-break: break-all; padding-right: 2.5rem; }
          @media (min-width: 768px) { .drawer-main-title { font-size: 1.75rem; padding-right: 0; } }
          .drawer-subtitle { font-size: 0.8125rem; color: #64748b; margin: 0 0 1.5rem 0; }
          
          .card-grid-4 { display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 2rem; }
          @media (min-width: 480px) { .card-grid-4 { grid-template-columns: repeat(3, 1fr); } }
          .d-card { background-color: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 0.75rem; }
          .d-card-icon-wrap { padding: 8px; border-radius: 50%; display: flex; flex-shrink: 0; }
          .d-card-title { font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; color: #64748b; margin: 0 0 0.15rem 0; }
          .d-card-value { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }

          .section-box { border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 8px; background-color: #ffffff; margin-bottom: 1.5rem; }
          @media (min-width: 768px) { .section-box { padding: 2rem; border-radius: 12px; margin-bottom: 2rem; } }
          .h2-section { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0 0 1.25rem 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; display: flex; align-items: center; }
          
          .info-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
          @media (min-width: 480px) { .info-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (min-width: 1024px) { .info-grid { grid-template-columns: repeat(3, 1fr); } }
          @media (min-width: 768px) { .text-dense-grid { grid-template-columns: repeat(4, 1fr) !important; } }
          
          .d-item { background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 0.875rem; border-radius: 6px; }
          .d-item-label { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin: 0 0 0.25rem 0; }
          .d-item-value { font-size: 0.875rem; font-weight: 600; color: #334155; margin: 0; word-break: break-all; }

          .limit-update-form { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 8px; width: 100%; max-width: 100%; }
          @media (min-width: 480px) { .limit-update-form { max-width: 26rem; } }
          .h4-title { font-size: 0.8125rem; font-weight: 700; color: #166534; margin: 0 0 0.5rem 0; text-transform: uppercase; }
          .input-group { display: flex; gap: 0.5rem; }
          .input-field { flex-grow: 1; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.875rem; min-width: 0; }
          .btn-update { background-color: #16a34a; color: #ffffff; padding: 8px 14px; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.8125rem; }
          .status-msg { font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 0.5rem; }
          .success-msg { color: #166534; } .error-msg { color: #991b1b; }

          .history-grid-split { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
          @media (min-width: 768px) { .history-grid-split { grid-template-columns: repeat(2, 1fr); } }
          .gateway-history-card { background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; }
          .gateway-history-card h4 { font-size: 0.8125rem; margin: 0 0 0.75rem 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          .gateway-list-scroll { display: flex; flex-direction: column; gap: 0.5rem; max-height: 12rem; overflow-y: auto; padding-right: 2px; }
          .gateway-history-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; gap: 8px; }
          .text-danger { color: #ef4444; }

          .drawer-loader-centered { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 1rem; color: #4338ca; font-weight: 500; }
          .loader-box { padding: 4rem 0; text-align: center; color: #4338ca; }
          .error-box { padding: 1.25rem; background-color: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; margin-bottom: 1.5rem; border-radius: 6px; font-size: 0.875rem; }
        `}
      </style>

      {errorMessage && <div className="error-box">⚠️ {errorMessage}</div>}

      <div className="list-view">
        <h1 className="h1-main">
          <Users style={{ width: 28, height: 28, marginRight: 8 }} /> Master Users Registry Floor
        </h1>
        
        <div className="search-bar">
          <input
            type="text" placeholder="Search parameters via telephone node or OID..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-search"
          />
          <button onClick={handleSearch} className="btn-search">Query</button>
        </div>

        <TableWithServerPagination
          isDemoUser={isDemoUser}
          data={searchResult !== null ? searchResult : users}
          children={
            <thead>
              <tr>
                {["S. No.", "Phone No.", "User Id", "Balance", "Invested", "Referral", "Actions", "View Module"].map((h, i) => (
                  <th key={i} scope="col" className="th">{h}</th>
                ))}
              </tr>
            </thead>
          }
          renderRow={renderUserRow}
          emptyMessage="No matching entities verified inside collection clusters."
          currentPage={currentPage}
          totalPages={paginationMeta.totalPages}
          totalItems={paginationMeta.totalItems}
          onPageChange={setCurrentPage}
          loading={loading || isSearching}
        />
      </div>

      {/* OVERLAY COMPARTMENT DRAWER MODULE */}
      {selectedUser && (
        <UserDetailsModal 
          selectedUserFromList={selectedUser}
          isDemoUser={isDemoUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

    </div>
  );
};

export default AllUsers;