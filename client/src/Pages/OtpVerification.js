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
  const { setUser } = useAuth();

  // Get email from sessionStorage (set during login)
  const email = sessionStorage.getItem("pendingEmail");

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

      const { user } = res.data;

      

      // Save user globally
      setUser(user);

      // Save in localStorage with the consistent lowercase role
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: user.username || user.email,
          role: user.position,
        })
      );
      localStorage.setItem("token", res.data.token);
      

      sessionStorage.removeItem("pendingEmail");
      setMessage(res.data.msg);
      console.log("CLEAR");
      // Redirect by role based on the lowercase role
      if (user.position === "System_Admin") {
        navigate("/System_Admin/UserManagement", { replace: true });
      } else if (user.position === "Admin") {
        navigate("/Admin/Dashboard", { replace: true });
      } else if (user.position === "Super_Admin") {
        navigate("/Superadmin/System_Admin", { replace: true });
      } else {
        navigate("/");
      }
    } catch (err) {
      // This is the corrected part.
      const status = err.response?.status;
      const backendMsg = err.response?.data?.msg;

      if (status === 400 || status === 404) {
        // Use the specific error message from the backend
        setMessage(backendMsg || "An error occurred.");
      } else {
        // For other errors (e.g., 500), use a generic message
        setMessage("Verification failed due to a server error.");
      }
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
          type="number"
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
