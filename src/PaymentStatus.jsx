import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, Loader2, X,Copy, AlertTriangle, ListChecks, DollarSign } from 'lucide-react';
import './PaymentStatus.css'; // Import CSS
import { API_BASE_URL } from './api';

const API_ADMIN_PENDING = `${API_BASE_URL}QR/api/admin/pending`;
const API_ADMIN_UPDATE = `${API_BASE_URL}QR/api/admin/payments/`;

async function handleResponse(res) {
  try {
    const clonedRes = res.clone();
    return await clonedRes.json();
  } catch (e) {
    console.log(e);
    return await res.text();
  }
}

const PaymentStatus = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const MessageDisplay = ({ text }) => {
    if (!text) return null;

    const isSuccess = text.includes('Updated') || text.includes('Approved');
    const isError = text.includes('failed') || text.includes('Error:');

    let wrapperClass = "msg-box";
    let icon;

    if (isSuccess) {
      wrapperClass += " success";
      icon = <CheckCircle className="icon" />;
    } else if (isError) {
      wrapperClass += " error";
      icon = <X className="icon" />;
    } else {
      wrapperClass += " info";
      icon = <Loader2 className="icon spin" />;
    }

    return (
      <div className={wrapperClass}>
        {icon}
        <span>{text}</span>
      </div>
    );
  };

  const fetchPendingPayments = useCallback(async () => {
    setIsLoading(true);
    setMessage('Fetching pending payments...');
    setPendingPayments([]);

    try {
      const res = await fetch(API_ADMIN_PENDING);
      const data = await handleResponse(res);

      if (!res.ok) {
        throw new Error(`Failed: ${res.status}`);
      }

      if (Array.isArray(data)) {
        setPendingPayments(data);
        setMessage(`${data.length} pending payments loaded.`);
      } else {
        throw new Error('Server response not a list.');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  const updatePaymentStatus = useCallback(async (id, status) => {
    setMessage(status=="Approved" ? 'Approving payment...' : 'Rejecting payment...');

    try {
      const res = await fetch(`${API_ADMIN_UPDATE}${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: status }),
      });

      const resultBody = await handleResponse(res);
      if (!res.ok) throw new Error(resultBody.message || res.statusText);

      setMessage(`Payment ID ${id} ${status=="Approved" ? 'Approved' : 'Rejected'}.`);
      fetchPendingPayments();
    } catch (error) {
      setMessage(`Update failed: ${error.message}`);
    }
  }, [fetchPendingPayments]);
const copyBankDetails = (bankDetails) => {
  const text = `
Holder Phone: ${bankDetails.phone||"non"}
Holder userId: ${bankDetails.userId}
Holder utr: ${bankDetails.utr}
Holder amount: ${bankDetails.amount} INR
  `.trim();

         
  navigator.clipboard.writeText(text)
    .then(() => alert("User details copied!"))
    .catch(() => alert("Failed to copy"));
};
  const PaymentItem = ({ payment }) => (
    <div className="payment-card">
      <div className="payment-header">
        <div className="payment-user">
          <p>User ID: <span>{payment.userId}</span></p>
          <p>User Phone No: <span>{payment?.phone||0}</span></p>
          <p>UTR: <span>{payment.utr}</span></p>
        </div>
        <p className="payment-amount">
          
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payment.amount)}
        </p>
      </div>

      <div className="payment-body">
        <div className="qr-box">
          <p>QR Image Proof:</p>
          <img
            src={payment.qrUrl}
            alt="QR Proof"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96?text=QR+Not+Found" }}
          />
        </div>
        <div className="payment-actions">
          <button onClick={() => updatePaymentStatus(payment._id, "Approve")} disabled={isLoading} className="approve-btn">
            <ListChecks className="icon" /> Approve
          </button>
          <button onClick={() => updatePaymentStatus(payment._id, "Reject")} disabled={isLoading} className="reject-btn">
            <X className="icon" /> Reject
          </button>
          <button  onClick={() => copyBankDetails(payment)} disabled={isLoading}   className="copy-btn"  >
            <Copy className="icon" /> Copy
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div className="page-header">
          <h1><AlertTriangle className="icon" /> Admin: Pending Payments</h1>
          <button onClick={fetchPendingPayments} disabled={isLoading} className="fetch-btn">
            <RefreshCw className={`icon ${isLoading ? 'spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Fetch Pending Payments'}
          </button>
          <MessageDisplay text={message} />
        </div>

        <div className="payment-list">
          {!isLoading && pendingPayments.length === 0 && message.includes("loaded") && (
            <div className="no-payments">
              <CheckCircle className="icon" />
              <p>No pending payments found. All clear!</p>
            </div>
          )}
          {pendingPayments.map(p => <PaymentItem key={p._id} payment={p} />)}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
