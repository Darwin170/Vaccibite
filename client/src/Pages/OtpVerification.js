// src/Pages/OtpVerification.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OtpVerification.css";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Get email from sessionStorage
  const email = sessionStorage.getItem("pendingEmail");

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Email not found. Please login again.");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/verify`,
        { email, otp }, // include email in request
        { withCredentials: true }
      );

      setMessage(res.data.msg);
      localStorage.setItem("token", res.data.token); // store JWT

      // Remove pending email from sessionStorage after successful verification
      sessionStorage.removeItem("pendingEmail");

      // Redirect based on user position
      if (res.data.user.position === "Superior_Admin") {
        navigate("/superior/dashboard");
      } else if (res.data.user.position === "System_Admin") {
        navigate("/admin/UserManagement");
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      setMessage(err.response?.data?.msg || "Verification failed");
    }
  };

  return (
    <div className="otp-container">
      <h2>OTP Verification</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify OTP</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default OtpVerification;
