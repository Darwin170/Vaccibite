import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OtpVerification.css";
import { useAuth } from "../routes/AuthContext";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0); // ⏳ Resend cooldown
  const navigate = useNavigate();
  const { user } = useAuth(); // Destructure 'user' and 'login'

  // Get email from sessionStorage (set during login)
  const email = sessionStorage.getItem("pendingEmail");

  // === NEW CHANGE STARTS HERE ===
  // Use a useEffect to handle navigation once the user is authenticated
  useEffect(() => {
    if (user) {
      const userRole = user.role ? user.role.toLowerCase() : 'user';

      if (userRole === "system_admin") {
        navigate("/System_Admin/UserManagement", { replace: true });
      } else if (userRole === "admin") {
        navigate("/Admin/Dashboard", { replace: true });
      } else if (userRole === "super_admin") {
        navigate("/Superadmin/SystemAdmin", { replace: true });
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);
  // === NEW CHANGE ENDS HERE ===

  // ---------------- Verify OTP ----------------
  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Email not found. Please login again.");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/verify`,
        { email, otp },
        { withCredentials: true }
      );

      const user = res.data?.user;
      const token = res.data?.token;

      if (!user || !token) {
        setMessage("Verification failed: User data or token not found.");
        return;
      }
      
      // Use the login function from AuthContext to handle state and localStorage
      

      // Save the token separately as AuthContext doesn't manage it
      localStorage.setItem("token", token);
      
      sessionStorage.removeItem("pendingEmail");
      setMessage(res.data.msg);
      console.log("CLEAR");

    } catch (err) {
      const errorMessage = err.response?.data?.msg || "Verification failed.";
      setMessage(errorMessage);
    }
  };

  // ---------------- Resend OTP ----------------
  const handleResendOtp = async () => {
    if (!email) {
      setMessage("Email not found. Please login again.");
      return;
    }
    if (cooldown > 0) return; // prevent spam

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/resend-otp`,
        { email },
        { withCredentials: true }
      );

      setMessage(res.data.msg || "A new OTP has been sent.");
      setCooldown(30); // 30 seconds cooldown
    } catch (err) {
      setMessage(err.response?.data?.msg || "Failed to resend OTP.");
    }
  };

  // ⏳ Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

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

      {/* Resend OTP button */}
      <button onClick={handleResendOtp} disabled={cooldown > 0}>
        {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default OtpVerification;
