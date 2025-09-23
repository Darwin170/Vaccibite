import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0); // ⏳ Resend cooldown
  const [user, setUser] = useState(null); // Local user state
  const navigate = useNavigate();

  // Get email from sessionStorage (set during login)
  const email = sessionStorage.getItem("pendingEmail");

  // This useEffect will watch for a change in the 'user' state.
  // This is the correct way to handle redirection after a successful login.
  useEffect(() => {
    if (user) {
      if (user.position === "System_Admin") {
        navigate("/System_Admin/UserManagement", { replace: true });
      } else if (user.position === "Admin") {
        navigate("/Admin/Dashboard", { replace: true });
      } else if (user.position === "Super_Admin") {
        navigate("/Superadmin/SystemAdmin", { replace: true });
      } else {
        // Fallback redirection for any other role
        navigate("/");
      }
    }
  }, [user, navigate]);

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
      
      const verifiedUser = res.data?.user;
      const token = res.data?.token;

      if (!verifiedUser || !token) {
        setMessage("Verification failed: User data or token not found.");
        return;
      }

      // Safely get the user's role and convert to lowercase for consistent comparison
      const userRole = verifiedUser.position ? verifiedUser.position.toLowerCase() : 'user';
      
      // Save the user data to the local state, which will trigger the useEffect
      setUser(verifiedUser);

      // Save in localStorage with the consistent lowercase role
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: verifiedUser.username || verifiedUser.email,
          role: userRole,
        })
      );
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
    <>
      <style>
        {`
          .otp-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
            font-family: sans-serif;
            background-color: #f0f2f5;
          }
          .otp-container h2 {
            color: #333;
            margin-bottom: 20px;
          }
          .otp-container input {
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            width: 250px;
          }
          .otp-container button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
          }
          .otp-container button[type="submit"] {
            background-color: #007bff;
            color: white;
          }
          .otp-container button[type="submit"]:hover {
            background-color: #0056b3;
          }
          .otp-container button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
          .otp-container p {
            margin-top: 20px;
            color: #d9534f;
          }
        `}
      </style>
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
    </>
  );
};

export default OtpVerification;
