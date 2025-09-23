import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../Superior/reportanalytic'; 
import BarangayMap from '../Superior/Mappage'; 
import EventsAndProgram from '../Superior/EventsAndPrograms';
import Resolution from '../Superior/resulotionpage';
import Report from '../Superior/ReportingSystem';


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
