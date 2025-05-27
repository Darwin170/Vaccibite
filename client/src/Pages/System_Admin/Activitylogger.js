import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const logActivity = async ({ userId }, action, details) => {
  try {
    await axios.post(`${API_URL}/auth/createLog`, {
      user: userId,
      action,
      details,
    });
  } catch (error) {
    console.error("Error saving activity log:", error);
  }
};
