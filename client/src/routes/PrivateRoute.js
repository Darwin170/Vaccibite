// src/routes/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // If user is not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user is logged in but doesn't have the required role
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  // User is authenticated and authorized
  return children;
};

export default PrivateRoute;
