import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../Admin/reportanalytic'; 
import BarangayMap from '../Admin/Mappage'; 
import EventsAndProgram from '../Admin/EventsAndPrograms';
import Resolution from '../Admin/resulotionpage';
import Report from '../Admin/ReportingSystem';


export default function AdminRoutes() {
  
  return (
    <Routes>
      <Route path="Dashboard" element={<Dashboard />} />
      <Route path="map" element={<BarangayMap />} />
      <Route path="EventsAndProgram" element={<EventsAndProgram />} />
      <Route path="Resolution" element={<Resolution />} />
      <Route path="Report" element={<Report />} />
    </Routes>
  );
}
