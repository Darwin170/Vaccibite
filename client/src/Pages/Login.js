import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";
import { useAuth } from '../routes/AuthContext';
import Vaccibitelogo from '../Assets/Vaccibitelogo.png';
import Acdclogo from '../Assets/Acdclogo.png';
import Qcvetlogo from '../Assets/Qcvetlogo.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, login } = useAuth(); 
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Use the consistent 'user.role' from the AuthContext
    // to redirect if the user is already logged in.
    if (user) {
      if (user.role === "System_Admin") {
        navigate("/System_Admin/UserManagement", { replace: true });
      } else if (user.role === "Admin") {
        navigate("/Admin/Dashboard", { replace: true });
      } else if (user.role === "Super_Admin") {
        navigate("/Superadmin/System_Admin", { replace: true });
      }
    }
  }, [user, navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLocked(false);
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
      
      // Check for OTP message and exit early
      if (response.data?.msg?.toLowerCase().includes("otp")) {
        sessionStorage.setItem("pendingEmail", normalizedEmail);
        navigate("/otp");
        return; // Exit the function here
      }

      // This block will only execute if OTP is not required.
      if (response.data && response.data.user) {
        const user = response.data.user;
        const token = response.data.token;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Ensure the role passed to AuthContext is consistent
        login({
          username: user.username || user.email,
          role: user.position,
          _id: user._id,
          token,
        });
        
        // Use the consistent 'user.position' for all login navigations
        if (user.position === "System_Admin") {
          navigate("/System_Admin/UserManagement", { replace: true });
        } else if (user.position === "Admin") {
          navigate("/Admin/Dashboard", { replace: true });
        } else if (user.position === "Super_Admin") {
          navigate("/Superadmin/System_Admin", { replace: true });
        } else {
          setError("Account has been deactivated.");
        }
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.msg || "Login failed. Try again.";
      setError(errorMessage);

      if (errorMessage.includes("Too many login attempts") || errorMessage.includes("Your account has been locked")) {
        setIsLocked(true);
      }
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
              disabled={isLocked}
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLocked}
            />
          </div>
          <button type="submit" className="login-button" disabled={isLocked}>Login</button>
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
