import React from 'react';
import { Routes, Route } from 'react-router-dom';
import System_Admin from '../Superadmin/SystemAdmin'; 
import SuperiorAdmin from '../Superadmin/SuperiorAdmin'; 
import MobileUser from '../Superadmin/MobileUser';
import ActivityLogs from '../Superadmin/Activitylogs';
import Usage from '../Superadmin/Usage';



export default function AdminRoutes() {
  
  return (
    <Routes>
      <Route path="SystemAdmin" element={<System_Admin />} />
      <Route path="SuperiorAdmin" element={<SuperiorAdmin />} />
      <Route path="MobileUser" element={<MobileUser />} />
      <Route path="ActivityLogs" element={<ActivityLogs />} />
      <Route path = "usage" element={<Usage/>}/>
    
    </Routes>
  );
}
