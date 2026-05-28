import React, { useState, useCallback, useEffect } from 'react';
import { 
  RefreshCw, CheckCircle, Loader2, X, AlertTriangle, ListChecks, Copy 
} from 'lucide-react';
import './withdrawRequest.css';
import { API_BASE_URL } from './api';

const API_WITHDRAW_PENDING = `${API_BASE_URL}api/withdraw/withdraw-pending`;
const API_WITHDRAW_APPROVE = `${API_BASE_URL}api/withdraw/withdraw-approve/`;
const API_WITHDRAW_REJECT = `${API_BASE_URL}api/withdraw/withdraw-reject/`;
const API_BANK_DETAILS = `${API_BASE_URL}api/withdraw/bank-details`;

async function handleResponse(res) {
  try {
    const clonedRes = res.clone();
    return await clonedRes.json();
  } catch (e) {
    console.log(e);
    return await res.text();
  }
}

const WithdrawRequest = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
 
  const [bankDetailsMap, setBankDetailsMap] = useState({});
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [localLoading, setLocalLoading] = useState(null); // Track which specific card is loading

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_WITHDRAW_PENDING);
      const data = await handleResponse(res);
      if (res.ok && Array.isArray(data.data)) {
        setWithdrawals(data.data);
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = async (id, status) => {
    setLocalLoading(id);
    try {
      const apiUrl = status === "approved" ? API_WITHDRAW_APPROVE : API_WITHDRAW_REJECT;
      const res = await fetch(`${apiUrl}${id}`, { method: 'PUT' });
      if (res.ok) {
        fetchWithdrawals();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLocalLoading(null);
    }
  };

  const toggleBankDetails = async (e, userId) => {
    e.preventDefault(); // Prevents scroll jump
    
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    if (!bankDetailsMap[userId]) {
      setLocalLoading(userId);
      try {
        const res = await fetch(API_BANK_DETAILS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        const data = await handleResponse(res);
        if (res.ok) {
          setBankDetailsMap(prev => ({
            ...prev,
            [userId]: { data: data.bankDetails, phone: data.phone }
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLocalLoading(null);
      }
    }
    setExpandedUserId(userId);
  };

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', scrollBehavior: 'smooth' }}>
      <div className="page-content">
        <div className="page-header">
          <h1><AlertTriangle className="icon" /> Pending</h1>
          <button onClick={fetchWithdrawals} className="fetch-btn">
            <RefreshCw className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        <div className="transaction-list">
          {withdrawals.map(item => (
            <div key={item._id} className="transaction-card" style={{ marginBottom: '10px', overflow: 'hidden' }}>
              <div className="transaction-header">
                <div>
                  <p style={{ margin: 0 }}>User: <strong>{item.user?._id}</strong></p>
                  <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                </div>
                <p className="transaction-amount">₹{item.amount}</p>
              </div>

              <div className="transaction-actions" style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <button onClick={() => updateStatus(item._id, "approved")} className="approve-btn">Approve</button>
                <button onClick={() => updateStatus(item._id, "rejected")} className="reject-btn">Reject</button>
                <button 
                  onClick={(e) => toggleBankDetails(e, item.user?._id)} 
                  style={{
                    backgroundColor: expandedUserId === item.user?._id ? '#ef4444' : '#3b82f6',
                    color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer'
                  }}
                >
                  {localLoading === item.user?._id ? '...' : expandedUserId === item.user?._id ? 'Close' : 'View Details'}
                </button>
              </div>

              {expandedUserId === item.user?._id && bankDetailsMap[item.user?._id] && (
                <div style={{
                  marginTop: '10px', padding: '15px', background: '#f3f4f6', borderRadius: '8px',
                  borderTop: '2px solid #3b82f6', animation: 'fadeIn 0.2s ease-in-out'
                }}>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <p><strong>Name:</strong> {bankDetailsMap[item.user?._id].data.holderName}</p>
                    <p><strong>A/C:</strong> {bankDetailsMap[item.user?._id].data.accountNumber}</p>
                    <p><strong>IFSC:</strong> {bankDetailsMap[item.user?._id].data.ifscCode}</p>
                    <p><strong>Phone:</strong> {bankDetailsMap[item.user?._id].phone}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const d = bankDetailsMap[item.user?._id];
                      navigator.clipboard.writeText(`Name: ${d.data.holderName}\nACC: ${d.data.accountNumber}\nIFSC: ${d.data.ifscCode}\nAmount: ${item.amount}`);
                      alert("Copied!");
                    }}
                    style={{ marginTop: '10px', width: '100%', padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px' }}
                  >
                    <Copy size={14} /> Copy Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WithdrawRequest;