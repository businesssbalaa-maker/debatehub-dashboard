import React, { useState } from "react";
import { 
  sendOtp, 
  checkAdminExist, 
  registerAdmin, 
  loginAdmin, 
  loginSubordinate,
  forgetAdminPassword
} from "./api";

const allowedAdminNumber = "9522575732";

const AuthCard = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [mode, setMode] = useState("login"); // 'login', 'register', 'forget'
  const [loginType, setLoginType] = useState("admin"); // 'admin' or 'subordinate'

  const handleSendOtp = async () => {
    if (!phone) return alert("Please enter phone number");
    if (mode === "register" && phone !== allowedAdminNumber) return alert("This number is not allowed to register");

    try {
      const check = await checkAdminExist(phone);
      if (!check.success) return alert(check.message);

      if (mode === "register" && check.exists) return alert("Admin already exists, please login");
      if (mode === "forget" && !check.exists) return alert("Admin not found");

      const res = await sendOtp(phone);
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setGeneratedOtp(data?.data?.otp || "");
        alert("OTP sent successfully");
      } else {
        alert(data?.data?.data?.message[0] || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    }
  };

  const handleVerifyOtp = () => {
    if (otp == generatedOtp) {
      setOtpVerified(true);
      alert("OTP verified! Enter password to proceed");
    } else {
      alert("OTP does not match");
    }
  };

  const handleRegister = async () => {
    if (!otpVerified) return alert("Please verify OTP first");
    if (!password) return alert("Enter password");

    const res = await registerAdmin(phone, password);
    if (res.success) {
      alert("Admin registered successfully! You can now login");
      resetAll();
      setMode("login");
    } else {
      alert(res.message || "Registration failed");
    }
  };

  const handleLogin = async () => {
    if (!phone || !password) return alert("Enter phone and password");

    let res;
    if (loginType === "admin") {
      res = await loginAdmin(phone, password);
    } else {
      res = await loginSubordinate(phone, password);
    }

    if (res.success) {
      alert(`${loginType} logged in successfully`);
      localStorage.setItem("NewTradingLoggedUser", JSON.stringify({ phone, type: loginType }));
      onLoginSuccess({ phone, type: loginType });
    } else {
      alert(res.message || "Login failed");
    }
  };

  const handleForgetPassword = async () => {
    if (!otpVerified) return alert("Please verify OTP first");
    if (!password) return alert("Enter new password");

    try {
      const res = await forgetAdminPassword(phone, password);
      if (res.success) {
        alert("Password updated successfully!");
        localStorage.setItem("NewTradingLoggedUser", JSON.stringify({ phone, type: "admin" }));
        resetAll();
        setMode("login");
      } else {
        alert(res.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating password");
    }
  };

  const resetAll = () => {
    setOtp("");
    setPassword("");
    setOtpSent(false);
    setOtpVerified(false);
    setGeneratedOtp("");
  };

  return (
    <div className="auth-card">
      <style>{`
        .auth-card {
          max-width: 400px;
          margin: 50px auto;
          padding: 30px 25px;
          border-radius: 15px;
          background: linear-gradient(135deg, #fdfbfb, #ebedee);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
        }
        .auth-card h2 {
          margin-bottom: 20px;
          color: #333;
        }
        .auth-card input, .auth-card select {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border-radius: 8px;
          border: 1px solid #ccc;
          outline: none;
          font-size: 16px;
          transition: 0.3s;
        }
        .auth-card input:focus, .auth-card select:focus {
          border-color: #4a90e2;
          box-shadow: 0 0 5px rgba(74,144,226,0.5);
        }
        .auth-card button {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: none;
          border-radius: 8px;
          background: #4a90e2;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          transition: 0.3s;
        }
        .auth-card button:hover {
          background: #357ab7;
        }
        .auth-card p {
          margin-top: 15px;
          font-size: 14px;
          color: #555;
        }
        .auth-card p span {
          color: #4a90e2;
          cursor: pointer;
          font-weight: bold;
        }
      `}</style>

      {mode === "register" && (
        <>
          <h2>Admin Registration</h2>
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {!otpSent ? (
            <button onClick={handleSendOtp}>Send OTP</button>
          ) : !otpVerified ? (
            <>
              <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <button onClick={handleVerifyOtp}>Verify OTP</button>
            </>
          ) : (
            <>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={handleRegister}>Register</button>
            </>
          )}
          <p>
            Already have an account? <span onClick={() => setMode("login")}>Login</span>
          </p>
        </>
      )}

      {mode === "login" && (
        <>
          <h2>Login</h2>
          <select value={loginType} onChange={(e) => setLoginType(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="subordinate">Subordinate</option>
          </select>
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
          <p>
            No account? <span onClick={() => setMode("register")}>Register as Admin</span>
          </p>
          <p>
            Forgot password? <span onClick={() => { resetAll(); setMode("forget"); }}>Forget Admin Password</span>
          </p>
        </>
      )}

      {mode === "forget" && (
        <>
          <h2>Forget Admin Password</h2>
          <input type="text" placeholder="Registered Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {!otpSent ? (
            <button onClick={handleSendOtp}>Send OTP</button>
          ) : !otpVerified ? (
            <>
              <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <button onClick={handleVerifyOtp}>Verify OTP</button>
            </>
          ) : (
            <>
              <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={handleForgetPassword}>Update Password</button>
            </>
          )}
          <p>
            Back to <span onClick={() => setMode("login")}>Login</span>
          </p>
        </>
      )}
    </div>
  );
};

export default AuthCard;
