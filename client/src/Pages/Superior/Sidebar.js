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
  <button onClick={() => navigate('/superior/EventsAndProgram')}>Events</button>
  <button onClick={() => navigate('/superior/Report')}>Reports</button>
  <button onClick={() => navigate('/superior/Resolution')}>Resolution</button>
  <button onClick={() => navigate('/superior/map')}> MAP</button>
  <button onClick={() => navigate('/superior/Dashboard')}>Monthly Report</button>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
  <br></br>
<div className='logout'>
  <button onClick={() => navigate('/Login')}>Logout</button></div>
</div>

  );
};

export default Sidebar;
