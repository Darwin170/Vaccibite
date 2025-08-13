// src/Pages/OtpVerification.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./OtpVerification.css"; // optional styling

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

 const handleVerify = async (e) => {
  e.preventDefault();
  try {
    const email = localStorage.getItem("email"); // or wherever you stored it after login
    if (!email) {
      setMessage("Email not found. Please login again.");
      return;
    }

    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/auth/verify`,
      { email, otp }, 
      { withCredentials: true } 
    );

    setMessage(res.data.msg);
    localStorage.setItem("token", res.data.token);

    // Redirect based on position if needed
    if (res.data.user.position === "Superior_Admin") {
      navigate("/superior/dashboard");
    } else {
      navigate("/system/dashboard");
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
