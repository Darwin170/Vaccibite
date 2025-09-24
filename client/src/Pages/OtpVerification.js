import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OtpVerification.css";
import { useAuth } from "../routes/AuthContext";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const { setUser } = useAuth();

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

      // FIX: Assign the user's role to a local variable
      const role = user.position; 
      
      setUser(user);

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: user.username || user.email,
          role: role, // Use the defined 'role' variable
        })
      );
      localStorage.setItem("token", res.data.token);
      
      sessionStorage.removeItem("pendingEmail");
      setMessage(res.data.msg);
      console.log("CLEAR");
      
     if (role === "System_Admin") {
  navigate("/System_Admin", { replace: true });
            } else if (role === "Admin") {
              navigate("/Admin", { replace: true });
            } else if (role === "Super_Admin") {
              navigate("/Superadmin", { replace: true });
            } else {
              navigate("/");
            }
    } catch (err) {
      const status = err.response?.status;
      const backendMsg = err.response?.data?.msg;

      if (status === 400 || status === 404) {
        setMessage(backendMsg || "An error occurred.");
      } else {
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
    if (cooldown > 0) return; 

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/resend-otp`,
        { email },
        { withCredentials: true }
      );

      setMessage(res.data.msg || "A new OTP has been sent.");
      setCooldown(30); 
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

      <button onClick={handleResendOtp} disabled={cooldown > 0}>
        {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default OtpVerification;
