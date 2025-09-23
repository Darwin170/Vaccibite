// src/Pages/Superior/Sidebar.js
import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../routes/AuthContext"; // ✅ use your context
import "./Sidebar.css";
import Vaccibitelogo from "../../Assets/Vaccibitelogo.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ logout from context

  const handleLogout = useCallback(() => {

    logout();


    navigate("/Login", { replace: true });

   
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

      <button onClick={() => navigate("/Admin/EventsAndProgram")}>Events</button>
      <button onClick={() => navigate("/Admin/Report")}>Reports</button>
      <button onClick={() => navigate("/Admin/Resolution")}>Resolution</button>
      <button onClick={() => navigate("/Admin/map")}>MAP</button>
      <button onClick={() => navigate("/Admin/Dashboard")}>Monthly Report</button>

      <div className="logout">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;
