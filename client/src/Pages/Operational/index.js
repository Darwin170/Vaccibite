import React from 'react';
import { Routes, Route } from 'react-router-dom';

import BarangayMap from './Mappage'; 
import EventsAndProgram from './EventsAndPrograms';
import Resolution from './resulotionpage';
import Report from './ReportingSystem';

export default function OperationalRoutes() {
  return (
    <Routes>
     
      <Route path="map" element={<BarangayMap />} />
      <Route path="EventsAndProgram" element={<EventsAndProgram />} />
      <Route path="Resolution" element={<Resolution />} />
      <Route path="Report" element={<Report />} />
    </Routes>
  );
}
