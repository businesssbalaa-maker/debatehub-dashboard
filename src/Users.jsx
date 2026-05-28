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
import { API_BASE_URL, deleteUser, searchuser } from "./api";

import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

// --- HELPER FUNCTIONS ---
const formatDate = (dateObj) => {
  if (!dateObj) return "N/A";

  // If MongoDB object with $date
  const isoString =
    typeof dateObj === "object" && dateObj.$date ? dateObj.$date : dateObj;

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

// --- CUSTOM HOOK FOR API FETCHING ---
const useFetch = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (!json.success) {
        throw new Error(json.message || "API call failed");
      }
      setData(json);
    } catch (e) {
      console.error("Fetch Error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      fetchData();
    } else {
      setLoading(false);
      setData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...dependencies, fetchData]); // Include fetchData to satisfy hook rule

  return { data, loading, error, refetch: fetchData };
};

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
        Showing{" "}
        <span style={{ fontWeight: 600 }}>
          {totalDisplay > 0 ? startIndex + 1 : 0}
        </span>{" "}
        to{" "}
        <span style={{ fontWeight: 600 }}>
          {Math.min(startIndex + totalDisplay, totalItems)}
        </span>{" "}
        of <span style={{ fontWeight: 600 }}>{totalItems}</span> entries
      </span>
      <div className="p-btns">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="p-btn"
        >
          Previous
        </button>
        <span className="p-indicator">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="p-btn"
        >
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
          <p>Loading...</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", flexGrow: 1 }}>
          <table className="table-base">
            {children}
            <tbody>
              {data && data.length > 0 ? (
                data.map((item, index) => {
                  if (isDemoUser) {
                    if (item?.phone == null || item?.phone?.startsWith("50")) {
                      return renderRow(item, startIndex + index);
                    }
                    return;
                  } else {
                    if (!item?.phone?.startsWith("50")) {
                      return renderRow(item, startIndex + index);
                    }
                    return;
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

// --- USER LIST VIEW ---
const UserTable = ({ onUserSelect, isDemoUser }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const userListUrl = `${API_BASE_URL}api/users/all?page=${currentPage}&limit=${PAGE_SIZE}`;
  const { data, loading, error } = useFetch(userListUrl, [currentPage]);
  const [users, setusers] = useState([]);

  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // ⬇️ update `users` every time `data` changes
  useEffect(() => {
    if (data?.users) {
      
      setusers(data.users);
    }
  }, [data]);
  const handleDelete = async (e, userId, phone) => {
    e.stopPropagation(); // prevent triggering row click
    if (!window.confirm(`Are you sure you want to delete user ${phone}?`))
      return;

    try {
      const response = await deleteUser(userId);
      // ✅ Check if status is 200 or success flag is true
      if (response?.success || response?.status === 200) {
        alert(response.message || "User deleted successfully");
        setusers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
      } else {
        alert(response?.message || "Delete failed on server");
      }
      console.log(users);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user. Check console for details.");
    }
  };

  const renderUserRow = (user, index) => (
    <tr
      key={formatOid(user._id)}
      className="tr-hover-user"
      onClick={() => onUserSelect(user)}
    >
      <td className="td">{index + 1}</td>
      <td className="td t-indigo font-semibold">{user.phone}</td>
      <td className="td text-xs">{formatOid(user._id)}</td>
      <td className="td t-green font-medium">₹{user.balance}</td>
      <td className="td">₹{user.totalBuy}</td>
      <td className="td">{user.referralCode}</td>
      <td className="td">
        {" "}
        <button
          className="btn-delete"
          aria-label={`Delete ${user.phone}`}
          onClick={(e) => handleDelete(e, user._id, user.phone)}
        >
          <Trash2 style={{ width: 16, height: 16, color: "red" }} />
        </button>
      </td>

      <td className="td">
        <button
          className="btn-view"
          aria-label={`View details for ${user.phone}`}
        >
          <ChevronsRight style={{ width: 16, height: 16 }} />
        </button>
      </td>
    </tr>
  );
  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchResult(null); // reset to normal table
      return;
    }

    // ✅ First, check if user exists locally
    const localUser = users.find(
      (u) => u.phone === searchTerm || u._id === searchTerm,
    );

    if (localUser) {
      setSearchResult([localUser]); // show only that user
      return;
    }

    // ✅ If not found locally, hit API
    setIsSearching(true);
    try {
      const res = await searchuser(searchTerm);
      console.log(res.data);
      if (res.data?.user && res.data.user.length > 0) {
        setSearchResult(res.data.user);
      } else {
        setSearchResult([]); // no users found
      }
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResult([]);
    } finally {
      setIsSearching(false);
    }
  };

  if (error)
    return <div className="error-box">Error loading users: {error}</div>;

  return (
    <div className="list-view">
      <h1 className="h1-main">
        <Users style={{ width: 32, height: 32, marginRight: 8 }} /> All Users
        Table
      </h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by phone or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-search"
        />
        <button onClick={handleSearch} className="btn-search">
          Search
        </button>
      </div>

      <TableWithServerPagination
        isDemoUser={isDemoUser}
        data={searchResult !== null ? searchResult : users}
        children={
          <thead className="t-head-user">
            <tr>
              {[
                "S. No.",
                "Phone",
                "User OID",
                "Balance",
                "Total Buy",
                "Ref Code",
                "Delete",
                "View Details",
              ].map((h, i) => (
                <th key={i} scope="col" className="th">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        }
        renderRow={renderUserRow}
        emptyMessage="No users found in the system."
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        loading={loading || isSearching}
      />
    </div>
  );
};



// --- GENERIC HISTORY TABLE ---
const HistoryTable = ({
  isDemoUser,
  userId,
  title,
  headers,
  endpoint,
  historyKey,
  renderRow,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const historyUrl = `${API_BASE_URL}api/users/${userId}/${endpoint}?page=${currentPage}&limit=${PAGE_SIZE}`;
  const { data, loading, error } = useFetch(historyUrl, [currentPage]);
  console.log(data,error);

  const historyData = data ? data[historyKey] || [] : [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalItems || 0;

  const renderHistoryRow = (item, index) => {
    // Use custom renderer if provided (e.g., for Purchases)
    if (renderRow) {
      return renderRow(item, index);
    }

    // Default renderer for Recharge/Withdraw History
    const isPending = item.approved === "Pending" || item.status === "Pending";
    const statusText = item.approved || item.status;
    const badgeClass = isPending ? "badge-p" : "badge-c";

    // Check if it is a recharge history row (includes utr)
    const isRecharge = item.utr !== undefined;

    return (
      <tr key={index} className="tr-hover-gray">
        <td className="td t-green font-medium">₹{item.amount}</td>
        {isRecharge && <td className="td">{item.utr}</td>}
        <td className="td">
          <span className={badgeClass}>{statusText}</span>
        </td>
        <td className="td text-xs">{formatDate(item.date)}</td>
      </tr>
    );
  };

  if (error)
    return (
      <div className="error-box-mini">
        Error loading {title}: {error}
      </div>
    );

  return (
    <div className="history-table-container">
      <h3 className="history-table-title">
        {title} ({totalItems})
      </h3>

      <TableWithServerPagination
        isDemoUser={isDemoUser}
        data={historyData}
        children={
          <thead className="t-head-history">
            <tr>
              {headers.map((h, i) => (
                <th key={i} scope="col" className="th">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        }
        renderRow={renderHistoryRow}
        emptyMessage={`No ${title.toLowerCase()} records found.`}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        loading={loading}
      />
    </div>
  );
};

// --- WITHDRAW LIMIT UPDATE COMPONENT ---
const WithdrawLimitUpdater = ({ userId, currentLimit, onUpdate }) => {
  const [limit, setLimit] = useState(currentLimit);
  const [status, setStatus] = useState(null); // 'success', 'error', 'loading'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch(
        `${API_BASE_URL}api/users/${userId}/withdraw-limit`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit: parseFloat(limit) }),
        },
      );

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
      setTimeout(() => setStatus(null), 3000); // Clear status after 3 seconds
    }
  };

  return (
    <form onSubmit={handleSubmit} className="limit-update-form">
      <h4 className="h4-title">Update Withdrawal Limit</h4>
      <div className="input-group">
        <input
          type="number"
          step="0.01"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          required
          className="input-field"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          className="btn-update"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <Loader className="animate-spin" size={16} />
          ) : (
            "Set New Limit"
          )}
        </button>
      </div>
      {status === "success" && (
        <p className="status-msg success-msg">
          <Check size={16} /> Limit updated successfully!
        </p>
      )}
      {status === "error" && (
        <p className="status-msg error-msg">
          <X size={16} /> Failed to update limit.
        </p>
      )}
    </form>
  );
};

// --- USER DETAILS VIEW ---
const UserDetails = ({
  selectedUserFromList,
  onBack,
  isDemoUser,
  deLoading,
}) => {
  // Fetch full details of the user
  const navigate = useNavigate();
  const detailUrl = `${API_BASE_URL}api/users/details/${formatOid(
    selectedUserFromList._id,
  )}`;
  const {
    data: detailData,
    loading: detailLoading,
    error: detailError,
    refetch: refetchDetails,
  } = useFetch(detailUrl, []);

  const user = detailData?.user || selectedUserFromList; // Use fetched data, fallback to list data

  const [withdrawLimit, setWithdrawLimit] = useState(user.withdrawLimit);

  useEffect(() => {
    if (user.withdrawLimit !== undefined) {
      setWithdrawLimit(user.withdrawLimit);
    }
  }, [user.withdrawLimit, user]);

  if (detailLoading && !detailData)
    return (
      <div className="loader-full-page">
        <Loader className="animate-spin text-indigo-500" size={64} />{" "}
        <p>Loading User Details...</p>
      </div>
    );
  if (detailError)
    return (
      <div className="error-box">Error loading user details: {detailError}</div>
    );
  if (!user) return <div className="error-box">User data missing.</div>;

  let {
    _id,
    phone,
    password,
    referralCode,
    referredBy,
    totalBuy,
    pendingIncome,
    productIncome,
    tasksReward,
    balance,
    referralBy_Phone,
    tradePassword,
    Withdrawal,
    team1 = [],
    team2 = [],
    team3 = [],
    luckySpin = {},
  } = user;

  const DetailItem = ({ label, value }) => (
    <div className="d-item">
      <p className="d-item-label">{label}</p>
      <p className="d-item-value">{value}</p>
    </div>
  );

  // Total members calculation can be inaccurate as team arrays are $slice'd (limited to 10) in the detail API.
  // A dedicated endpoint for total members would be ideal, but for now we use the slice'd data.

  const renderPurchaseRow = (stockRow, index) => {
    return (
      <tr key={index}>
        <td className="td">{stockRow.stockId}</td>
        <td className="td">{stockRow.stockName}</td>

        <td className="td text-center">
          <button
            onClick={() => navigate(`/stock/${stockRow.stockId}`)}
            className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600"
          >
            View
          </button>
        </td>

        <td className="td">₹{stockRow.singleUnitValue}</td>
        <td className="td">{stockRow.totalStockUnits}</td>
        <td className="td">{stockRow.leftStockUnits}</td>
        <td className="td">₹{stockRow.soldStockAmount}</td>
        <td className="td">{formatDate(stockRow.lastSoldDate)}</td>
        <td className="td">{formatDate(stockRow.purchaseDate)}</td>
      </tr>
    );
  };
 const renderSoldRow = (stockRow, index) => {
    return (
      <tr key={index}>   <td className="td">{stockRow.purchaseId}</td>
        <td className="td">{stockRow.stockId}</td>
     
        <td className="td">{stockRow.unitsSold}</td>

        <td className="td text-center">
          <button
            onClick={() => navigate(`/stock/${stockRow.stockId}`)}
            className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600"
          >
            View
          </button>
        </td>

        <td className="td">₹{stockRow.soldPricePerUnit}</td>
        <td className="td">{stockRow.totalSoldAmount}</td>
        <td className="td">{stockRow.totalunits}</td>
        <td className="td">{stockRow.remainingUnitsAfterSell}</td>
      
       
        <td className="td">{formatDate(stockRow.soldDate)}</td>

      </tr>
    );
  };
  return (
    <div className="details-view">
      <button onClick={onBack} className="btn-back btn-base">
        <ChevronLeft style={{ width: 16, height: 16, marginRight: 8 }} /> Back
        to All Users
      </button>

      <h1 className="h1-detail">Id | {formatOid(_id)}</h1>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: 32 }}>
        User phone: {phone} | Created At: {formatDate(user.createdAt)}
      </p>

      {/* --- FINANCIAL OVERVIEW --- */}
      <div className="card-grid-4">
        <DetailCard
          title="Current Balance"
          value={`₹${balance}`}
          icon={DollarSign}
          color="#10b981"
        />
        <DetailCard
          title="Referral Income"
          value={`₹${0}`}
          icon={Loader}
          color="#f59e0b"
        />
        <DetailCard
          title="Total Buy"
          value={`₹${totalBuy}`}
          icon={ShoppingCart}
          color="#4f46e5"
        />
        <DetailCard
          title="Withdraw Limit"
          value={`₹${withdrawLimit}`}
          icon={DollarSign}
          color="#ef4444"
        />
      </div>

      {/* --- GENERAL INFO --- */}
      <div className="section-box">
        <h2 className="h2-section">
          <Users
            style={{ width: 24, height: 24, marginRight: 12, color: "#4f46e5" }}
          />
          General Information
        </h2>
        <div className="info-grid">
          <DetailItem label="Phone Number" value={phone} />
          <DetailItem label="Password" value={password || "N/A"} />
          <DetailItem label="Trade Password" value={tradePassword || "N/A"} />
          <DetailItem label="Referral Code" value={referralCode} />
          <DetailItem label="Referred By" value={referredBy || "None"} />
          <DetailItem
            label="referral By Phone"
            value={referralBy_Phone || "None"}
          />

          <DetailItem label="Total Withdrawal" value={`₹${Withdrawal || 0}`} />
        </div>

        <div
          style={{
            marginTop: 24,
            marginBottom: 24,
            borderTop: "1px solid #eef2ff",
          }}
        >
          <WithdrawLimitUpdater
            userId={formatOid(_id)}
            currentLimit={withdrawLimit}
            onUpdate={(newLimit) => {
              setWithdrawLimit(newLimit);
              refetchDetails();
            }}
          />
        </div>
      </div>

      {/* --- PURCHASE HISTORY - Paginated API call --- */}
      <div className="section-box">
        <h2 className="h2-section">
          <ShoppingCart
            style={{ width: 24, height: 24, marginRight: 12, color: "#4f46e5" }}
          />
          Purchase History
        </h2>
        <HistoryTable
          isDemoUser={isDemoUser}
          userId={formatOid(_id)}
          title="Purchase History"
          headers={[
            "StockId",
            "Stock Name",
            "View Stock",
            "Single Unit Value",
            "Total Stock Units",
            "Left Status",
            "Sold Stock Amount",
            "Last Sold Date",
            "Purchase Date",
          ]}
          endpoint="purchases"
          historyKey="purchases"
          renderRow={renderPurchaseRow}
        />
      </div>
<div className="section-box">
        <h2 className="h2-section">
          <ShoppingCart
            style={{ width: 24, height: 24, marginRight: 12, color: "#4f46e5" }}
          />
          Sold History
        </h2>
        <HistoryTable
          isDemoUser={isDemoUser}
          userId={formatOid(_id)}
          title="Purchase History"
          headers={[
            "Purchase Id",
            "Stock Id",
            "Units Sold",
            "View Stock",
            "Sold Price Per Unit",
            "Total Sold Amount",
            "total units",
            "remaining Units After Sell",
            "Sold Date",
       
          ]}
          endpoint="soldStock"
          historyKey="SoldStock"
          renderRow={renderSoldRow}
        />
      </div>
      {/* --- FINANCIAL HISTORY (Recharge & Withdraw) --- */}
      <div className="section-box">
        <h2 className="h2-section">
          <DollarSign
            style={{ width: 24, height: 24, marginRight: 12, color: "#4f46e5" }}
          />
          Financial History
        </h2>
        <div className="history-grid-2">
          {/* Note: Recharge History endpoint is missing, assuming a similar /:id/recharges exists or we use full detail data if small. Using mock structure for now */}
          {/* Fallback to full detail data if API for recharge is not present (REMOVED) */}
          {/* RECHARGE HISTORY - NOW INTEGRATED */}
          <HistoryTable
            isDemoUser={isDemoUser}
            userId={formatOid(_id)}
            title="Recharge History"
            headers={["Amount", "UTR", "Status", "Date"]}
            endpoint="recharge" // 👈 New API endpoint
            historyKey="rechargeHistory"
          />
          <HistoryTable
            isDemoUser={isDemoUser}
            userId={formatOid(_id)}
            title="Withdrawal History"
            headers={["Amount", "Status", "Date"]}
            endpoint="withdraws"
            historyKey="withdrawHistory"
          />
        </div>
      </div>
    </div>
  );
};

// --- CARD AND DETAIL ITEM COMPONENTS (Unmodified) ---
const DetailCard = ({ title, value, icon: Icon, color }) => (
  <div className="d-card">
    <div
      className="d-card-icon-wrap"
      style={{ color: color, backgroundColor: color }}
    >
      <Icon style={{ width: 24, height: 24, color: "black" }} />
    </div>
    <div>
      <p className="d-card-title">{title}</p>
      <p className="d-card-value">{value}</p>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---
const AllUsers = ({ isDemoUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState("list"); // 'list' or 'details'

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setView("details");
  };

  const handleBack = () => {
    setSelectedUser(null);
    setView("list");
  };
  const deLoading = (type, type2) => {
    setView(type2); // show loading / alternate view first

    setTimeout(() => {
      setView(type); // after delay set original view
    }, 600); // 1 second delay
  };

  return (
    <div className="allUser">
      <style>
        {`
          /* Optimized CSS */
          .allUser {
            min-height: 100vh;
            background-color: #f3f4f6;
            font-family: 'Inter', sans-serif;
            position: relative;
            width: 100%;
            overflow-y: scroll;
          }
          .list-view, .details-view { padding: 16px; }
          .details-view { background-color: #f9fafb; min-height: 100vh; }
          @media (min-width: 768px) {
              .list-view, .details-view { padding: 32px; }
          }

          /* Headings */
          .h1-main { font-size: 1.875rem; font-weight: 800; margin-bottom: 24px; color: #4338ca; display: flex; align-items: center; }
          .h1-detail { font-size: 2.25rem; font-weight: 800; margin-bottom: 8px; color: #111827; }
          .h2-section { font-size: 1.5rem; font-weight: 800; margin-bottom: 24px; padding-bottom: 8px; border-bottom: 2px solid #c7d2fe; color: #111827; display: flex; align-items: center; }
          .h3-title { font-size: 1.25rem; font-weight: 700; color: #1f2937; padding-bottom: 8px; margin-bottom: 16px; border-bottom: 1px solid #eef2ff; }

          /* Buttons */
          .btn-base { display: inline-flex; align-items: center; padding: 8px 16px; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: background-color 0.15s ease-in-out; cursor: pointer; }
          .btn-back { margin-bottom: 24px; color: #ffffff; background-color: #4f46e5; }
          .btn-back:hover { background-color: #4338ca; }
          .btn-view { padding: 4px; background-color: #6366f1; color: #ffffff; border-radius: 9999px; }
          .btn-view:hover { background-color: #4f46e5; }
          .btn-update { padding: 8px 16px; background-color: #10b981; color: #ffffff; border-radius: 0.5rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }
          .btn-update:hover:not(:disabled) { background-color: #059669; }
          .btn-update:disabled { opacity: 0.5; cursor: not-allowed; }

          /* Layouts & Cards */
          .section-box { margin-bottom: 40px; padding: 24px; background-color: #ffffff; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid #f3f4f6; }
          .card-grid-4 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 40px; }
          @media (min-width: 1024px) { .card-grid-4 { grid-template-columns: repeat(4, 1fr); } }
          .info-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 24px; }
          @media (min-width: 768px) { .info-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (min-width: 1024px) { .info-grid { grid-template-columns: repeat(3, 1fr); } }
          .history-grid-2 { display: grid; gap: 32px; }
          @media (min-width: 1024px) { .history-grid-2 { grid-template-columns: repeat(2, 1fr); } }

          /* Detail Items & Cards */
          .d-card { background-color: #ffffff; padding: 16px; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #f3f4f6; display: flex; align-items: center; gap: 16px; }
          .d-card-icon-wrap { padding: 12px; border-radius: 9999px; 	}
          .d-card-title { font-size: 0.875rem; font-weight: 500; color: #6b7280; }
          .d-card-value { font-size: 1.25rem; font-weight: 700; color: #1f2937; }
          .d-item { padding: 12px; background-color: #f9fafb; border-radius: 0.5rem; border: 1px solid #f3f4f6; }
          .d-item-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #6b7280; }
          .d-item-value { font-size: 1rem; font-weight: 500; color: #1f2937; word-break: break-word; }

          /* Table Base */
          .table-wrap { border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); background-color: #ffffff; display: flex; flex-direction: column; min-height: 300px; }
          .table-base { min-width: 100%; border-collapse: collapse; border-color: #f3f4f6; }
          .th { padding: 12px 16px; text-align: left; font-size: 0.75rem; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; }
          .td { padding: 12px 16px; white-space: nowrap; font-size: 0.875rem; color: #1f2937; }

          /* Table Specific Styles & Hovers */
          .t-head-user { background-color: #eef2ff; }
          .t-head-team { background-color: #e0e7ff; }
          .t-head-purchase { background-color: #f9fafb; }

          .tr-hover-user:hover { background-color: #eef2ff; cursor: pointer; transition: background-color 0.15s ease-in-out; }
          .tr-hover-gray:hover { background-color: #f9fafb; }

          .purchase-claimed { background-color: #f0fdf4; }
          .purchase-claimed:hover { background-color: #dcfce7; }
          .purchase-waiting { background-color: #fffbeb; }
          .purchase-waiting:hover { background-color: #fef3c7; }

          /* Badges & Text Colors */
          .badge-p, .badge-c { padding: 2px 8px; display: inline-flex; font-size: 0.75rem; line-height: 1.25rem; font-weight: 600; border-radius: 9999px; align-items: center; }
          .badge-p { background-color: #fef3c7; color: #92400e; } /* Pending/Waiting */
          .badge-c { background-color: #d1fae5; color: #065f46; } /* Completed/Claimed */
          .t-indigo { color: #4f46e5; }
          .t-green { color: #047857; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .text-xs { font-size: 0.75rem; }
          .text-sm { font-size: 0.875rem; }

          /* Team Details */
          .team-box { margin-bottom: 32px; border: 1px solid #f3f4f6; padding: 16px; border-radius: 0.75rem; background-color: #f9fafb; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
          .team-sum-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 16px; margin-bottom: 24px; }
          @media (min-width: 768px) { .team-sum-grid { grid-template-columns: repeat(2, 1fr); } }

          /* History Table Specifics */
          .history-table-container {
              border: 1px solid #e5e7eb;
              border-radius: 0.75rem;
              overflow: hidden;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          .history-table-title {
            font-size: 1.25rem;
            font-weight: 700;
            padding: 16px;
            background-color: #eef2ff;
            color: #3730a3;
            border-bottom: 1px solid #e5e7eb;
          }

          /* Pagination */
          .p-controls { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding: 12px; background-color: #eef2ff; border-radius: 0 0 0.75rem 0.75rem; border-top: 1px solid #c7d2fe; }
          .p-info { font-size: 0.875rem; color: #4b5563; }
          .p-btns { display: flex; gap: 8px; }
          .p-btn { padding: 4px 12px; font-size: 0.875rem; font-weight: 500; border-radius: 0.5rem; color: #4f46e5; background-color: #ffffff; border: 1px solid #a5b4fc; transition: background-color 0.15s ease-in-out; cursor: pointer; }
          .p-btn:hover:not(:disabled) { background-color: #e0e7ff; }
          .p-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .p-indicator { padding: 4px 12px; font-size: 0.875rem; font-weight: 600; color: #3730a3; background-color: #ffffff; border-radius: 0.5rem; border: 1px solid #a5b4fc; display: flex; align-items: center; justify-content: center; }
          .empty-msg { color: #6b7280; padding: 16px; text-align: center; border: 2px dashed #e5e7eb; border-radius: 0.5rem; }
          .empty-msg-inline { color: #6b7280; text-align: center; }
          
          /* Loader/Error Boxes */
          .loader-full-page { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px; font-size: 1.25rem; color: #4f46e5; }
          .loader-box { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.8); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px; z-index: 10; }
          .error-box { padding: 24px; margin: 24px; background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 0.75rem; font-weight: 500; }
          .error-box-mini { padding: 12px; background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 0.5rem; font-size: 0.875rem; margin-top: 16px; }

          /* Limit Updater Form */
          .limit-update-form {
              padding: 16px;
              background-color: #f0f9ff;
              border: 1px solid #bfdbfe;
              border-radius: 0.75rem;
          }
          .h4-title { font-size: 1rem; font-weight: 700; color: #1e3a8a; margin-bottom: 8px; }
          .input-group { display: flex; gap: 12px; align-items: center; }
          .input-field {
              padding: 8px 12px;
              border: 1px solid #d1d5db;
              border-radius: 0.5rem;
              flex-grow: 1;
              max-width: 200px;
          }
          .status-msg {
              display: flex;
              align-items: center;
              gap: 4px;
              margin-top: 8px;
              padding: 8px;
              border-radius: 0.5rem;
              font-size: 0.875rem;
              font-weight: 600;
          }
          .success-msg { background-color: #d1fae5; color: #065f46; }
          .error-msg { background-color: #fee2e2; color: #991b1b; }
        `}
      </style>
      {view === "list" && (
        <UserTable onUserSelect={handleUserSelect} isDemoUser={isDemoUser} />
      )}

      {view === "details" && selectedUser && (
        <UserDetails
          selectedUserFromList={selectedUser}
          onBack={handleBack}
          isDemoUser={isDemoUser}
          deLoading={deLoading}
        />
      )}
    </div>
  );
};

export default AllUsers;
