// src/Pages/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";
import { useAuth } from '../routes/AuthContext';
import { logActivity } from './System_Admin/Activitylogger';
import Vaccibitelogo from '../Assets/Vaccibitelogo.png';
import Acdclogo from '../Assets/Acdclogo.png';
import Qcvetlogo from '../Assets/Qcvetlogo.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          email: normalizedEmail,
          password,
        },
        { withCredentials: true }
      );

      // If OTP is sent, go to OTP verification page
      if (response.data?.msg?.toLowerCase().includes("otp")) {
        // Store email in sessionStorage for OTP page
        sessionStorage.setItem("pendingEmail", normalizedEmail);
        navigate("/otp");
        return;
      }

      // If backend still returns user directly (non-OTP flow)
      if (response.data && response.data.user) {
        const user = response.data.user;
        setUser(user);

        localStorage.setItem("user", JSON.stringify({
          username: user.username || user.email,
          role: user.position,
        }));

        await logActivity(
          {
            userId: user._id,
            username: user.email,
            position: user.position,
          },
          "Login",
          "User logged in successfully"
        );

        if (user.position === "System_Admin") {
          navigate("/admin/UserManagement");
        } else if (user.position === "Superior_Admin") {
          navigate("/superior/Dashboard");
        } else {
          setError("Unauthorized role.");
          console.log("User role:", user.position);
          alert("Role is: " + user.position);
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.msg || "Login failed. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={Vaccibitelogo} alt="Vaccibite Logo" className="logo-image" />
        <h2 className="login-title">Vaccibite Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="logo-row">
          <img src={Acdclogo} alt="ACDC" className="bottom-logo" />
          <img src={Qcvetlogo} alt="QCVET" className="bottom-logo" />
        </div>
      </div>
    </div>
  );
};

export default Login;
