// src/Pages/System_Admin/Activitylogger.js
import axios from "axios";

export const logActivity = async (action, details) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage — skipping activity log");
      return null;
    }

    const res = await axios.post(
`${process.env.REACT_APP_API_URL}/auth/createLog`,
      { action, details },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Activity logged:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error saving activity log:", error.response?.data || error.message || error);
    return null;
  }
};

export default logActivity; // optional: keeps compatibility with default import
