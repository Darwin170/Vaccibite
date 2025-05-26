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
  <button onClick={() => navigate('/operational/EventsAndProgram')}>Events</button>
  <button onClick={() => navigate('/operational/Report')}>Reports</button>
  <button onClick={() => navigate('/operational/Resolution')}>Resolution</button>
  <button onClick={() => navigate('/operational/map')}> MAP</button>
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
  <br></br>
  <br></br>
  <div className='logout'>
  <button onClick={() => navigate('/Login')}>Logout</button></div>
</div>

  );
};

export default Sidebar;
