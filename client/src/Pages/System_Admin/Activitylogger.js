import axios from "axios";

export const logActivity = async ({ userId }, action, details) => {
  try {
    await axios.post("http://localhost:8787/auth/createLog", {
      user: userId,
      action,
      details,
    });
  } catch (error) {
    console.error("Error saving activity log:", error);
  }
};
