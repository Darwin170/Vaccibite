// src/Pages/OtpVerification.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OtpVerification.css";
import { useAuth } from '../routes/AuthContext'; // 👈 Import useAuth hook
import { logActivity } from './System_Admin/Activitylogger'; // 👈 Import logActivity

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth(); // 👈 Use the setUser function from AuthContext

  // Get email from sessionStorage
  const email = sessionStorage.getItem("pendingEmail");

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Email not found. Please login again.");
      return;
    }

    try {
      // 1. Make the API call to verify the OTP
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/verify`,
        { email, otp },
        { withCredentials: true }
      );

      // Your backend returns the user object, which is exactly what we need
      const { user } = res.data;

      // 2. Set the user in the global AuthContext state
      setUser(user);

      // 3. Store the full user object in localStorage for PrivateRoute to use
      localStorage.setItem("user", JSON.stringify({
        username: user.username || user.email,
        role: user.position,
      }));

      // You are already storing the JWT, which is good practice.
      localStorage.setItem("token", res.data.token);

      // 4. Log the login activity
      await logActivity(
        { userId: user._id, username: user.email, position: user.position },
        "Login",
        "User logged in via OTP successfully"
      );

      // 5. Remove pending email from sessionStorage after successful verification
      sessionStorage.removeItem("pendingEmail");

      setMessage(res.data.msg);

      // 6. Redirect based on user position
      if (user.position === "Superior_Admin") {
        navigate("/superior/dashboard");
      } else if (user.position === "System_Admin") {
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
