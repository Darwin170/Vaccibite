// ActivityTracker.js
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { logActivity } from "./Activitylogger";

const ActivityTracker = ({ currentUser }) => {
  const location = useLocation();
    useEffect(() => {
  console.log("ActivityTracker triggered", currentUser, location.pathname);
  if (currentUser) {
    logActivity(
      { userId: currentUser.id },
      "Navigated",
      `Visited: ${location.pathname}`
    );
  }
}, [location, currentUser]);

  return null;
};

export default ActivityTracker;
