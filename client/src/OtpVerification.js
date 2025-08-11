// src/Pages/OtpVerification.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../routes/AuthContext";
import { logActivity } from "./System_Admin/Activitylogger";
import "./Login.css"; // reuse your login styles

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("OTP is required.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/verify-otp`,
        { otp },
        { withCredentials: true } // important for session cookies
      );

      if (response.data && response.data.user) {
        const user = response.data.user;
        const token = response.data.token;

        // Save to context
        setUser(user);

        // Store in localStorage
        localStorage.setItem("user", JSON.stringify({
          username: user.email,
          role: user.position,
        }));
        localStorage.setItem("token", token);

        // Log the activity
        await logActivity(
          {
            userId: user._id,
            username: user.email,
            position: user.position,
          },
          "Login",
          "User logged in successfully"
        );

        // Navigate based on role
        if (user.position === "System_Admin") {
          navigate("/admin/UserManagement");
        } else if (user.position === "Superior_Admin") {
          navigate("/superior/Dashboard");
        } else {
          setError("Unauthorized role.");
        }
      } else {
        setError("Invalid server response.");
      }
    } catch (err) {
      setError(err.response?.data?.msg || "OTP verification failed.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">OTP Verification</h2>
        <p>Please enter the 6-digit code sent to your email.</p>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleVerify}>
          <div className="input-group">
            <label>OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
          </div>
          <button type="submit" className="login-button">Verify OTP</button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
