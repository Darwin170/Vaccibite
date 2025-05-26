import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Activitylogs from '../System_Admin/Activitylogs'; 
import UserManagement from '../System_Admin/UserManagement';
import Backup from '../System_Admin/backup';
import Archive from '../System_Admin/Archiving';


export default function System_AdminRoutes() {
  return (
    <Routes>
      <Route path="Activitylogs" element={<Activitylogs />} />
      <Route path="UserManagement" element={<UserManagement />} />
      <Route path="Backup" element={<Backup />} />
      <Route path="Archive" element={<Archive />} />
    </Routes>
  );
}
