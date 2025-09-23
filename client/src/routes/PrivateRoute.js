// src/routes/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth(); // get from AuthContext

  // If no session → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If wrong role → redirect
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authenticated + authorized
  return children;
};

export default PrivateRoute;
