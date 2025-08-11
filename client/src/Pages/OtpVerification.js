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
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp", // change to your backend route
        { otp },
        { withCredentials: true } // needed if using express-session
      );

      setMessage(res.data.msg);
      // Store token if needed
      localStorage.setItem("token", res.data.token);

      // Redirect to dashboard or homepage
      navigate("/dashboard");
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
