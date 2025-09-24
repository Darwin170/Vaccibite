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
  const { user, login } = useAuth(); // Import `login` to update state on successful resend
  const email = sessionStorage.getItem("pendingEmail");

  // useEffect(() => {
  //   // Navigate only after the user object is successfully updated in AuthContext.
  //   if (user) {
  //     if (user.role === "System_Admin") {
  //       navigate("/System_Admin/UserManagement", { replace: true });
  //     } else if (user.role === "Admin") {
  //       navigate("/Admin/Dashboard", { replace: true });
  //     } else if (user.role === "Super_Admin") {
  //       navigate("/Superadmin/System_Admin", { replace: true });
  //     } else {
  //       navigate("/");
  //     }
  //   }
  // }, [user, navigate]);

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

      const { user, token } = res.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      
      login({
        username: user.username || user.email,
        role: user.position,
        _id: user._id,
        token,
      });

      sessionStorage.removeItem("pendingEmail");
      setMessage(res.data.msg);
  if (user.position === "System_Admin") {
        navigate("/System_Admin/UserManagement", { replace: true });
      } else if (user.position === "Admin") {
        navigate("/Admin/Dashboard", { replace: true });
      } else if (user.position === "Super_Admin") {
        navigate("/Superadmin/System_Admin", { replace: true });
      } else {
        setError("Account has been deactivated or role not recognized.");
      }

    } catch (err) {
      const status = err.response?.status;
      const backendMsg = err.response?.data?.msg;

      if (status === 400 || status === 404) {
        setMessage(backendMsg || "Invalid OTP or request.");
      } else {
        setMessage("Verification failed due to a server error.");
      }
    }
  };

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
