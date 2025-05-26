// Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import AAcdclogo from '../../Assets/Acdclogo.png';
import AQcvetlogo from '../../Assets/Qcvetlogo.png';
import Vaccibitelogo from '../../Assets/Vaccibitelogo.png';



const Sidebar = () => {
  const navigate = useNavigate();

  return (
<div className="app-sidebar">
    <div className="Vaccibite">
        <img src={Vaccibitelogo} alt="Vaccibite" width="115" height="115" /></div>

  <button onClick={() => navigate('/admin/UserManagement')}>User Management</button>
  <button onClick={() => navigate('/admin/Activitylogs')}>Activity Log</button>
  <button onClick={() => navigate('/admin/Backup')}>Back-up</button>
  <button onClick={() => navigate('/admin/Archive')}>Archive</button>
  <button onClick={() => navigate('/Login')}>Logout</button>
</div>

  );
};

export default Sidebar;
