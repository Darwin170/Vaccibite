// src/Pages/System_Admin/Sidebar.js
import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../routes/AuthContext"; // ✅ import context
import "./Sidebar.css";
import Vaccibitelogo from "../../Assets/Vaccibitelogo.png";
import AAcdclogo from "../../Assets/Acdclogo.png";
import AQcvetlogo from "../../Assets/Qcvetlogo.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ from context

  const handleLogout = useCallback(() => {
    // Clear session
    logout();

    // Redirect to Login (check your route casing!)
    navigate("/Login", { replace: true });

    // Prevent back button from re-entering protected routes
    window.history.pushState(null, "", window.location.href);
  }, [logout, navigate]);

  useEffect(() => {
    const handleBackButton = () => {
      handleLogout();
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [handleLogout]);

  return (
    <div className="app-sidebar">
      <div className="Vaccibite">
        <img src={Vaccibitelogo} alt="Vaccibite" width="115" height="115" />
      </div>

      <button onClick={() => navigate("/Superadmin/SystemAdmin")}>System Admin </button>
      <button onClick={() => navigate("/Superadmin/SuperiorAdmin")}>Admin</button>
      <button onClick={() => navigate("/Superadmin/MobileUser")}>Mobile User</button>
      <button onClick={() => navigate("/Superadmin/Activitylogs")}>Activity Log</button>
      <button onClick={() => navigate("/Superadmin/Usage")}>Usage</button>


      <div className="logout">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;
