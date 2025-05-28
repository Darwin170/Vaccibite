import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../routes/AuthContext";
import { logActivity } from "./System_Admin/Activitylogger";

import Vaccibitelogo from "../Assets/Vaccibitelogo.png";
import Acdclogo from "../Assets/Acdclogo.png";
import Qcvetlogo from "../Assets/Qcvetlogo.png";
import "./Login.css";

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
      // Normalize the email for consistency
      const normalizedEmail = email.trim().toLowerCase();

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          email: normalizedEmail,
          password,
        }
      );

      if (response.data && response.data.user) {
        const user = response.data.user;

        // Save user in global context for application-wide access
        setUser(user);

        // Cache minimal user details in localStorage for protected routes
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: user.username || user.email,
            role: user.position,
          })
        );

        // Log the login activity
        await logActivity(
          {
            userId: user._id,
            username: user.username || user.email,
            position: user.position,
          },
          "Login",
          "User logged in successfully"
        );

        // Navigate based on user role
        switch (user.position) {
          case "System_Admin":
            navigate("/admin/UserManagement");
            break;
          case "Superior_Admin":
            navigate("/superior/Dashboard");
            break;
          case "Operational_Staff":
            navigate("/operational/Report");
            break;
          default:
            setError("Unauthorized role.");
            console.error("Unauthorized role:", user.position);
            break;
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img
          src={Vaccibitelogo}
          alt="Vaccibite Logo"
          className="logo-image"
        />
        <h2 className="login-title">Vaccibite Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
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
