import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import './Sidebar.css';
import Sidebar from './Sidebar';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const Dashboard = () => {
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [startMonth, setStartMonth] = useState('1');
  const [endMonth, setEndMonth] = useState('12');
  const [status, setStatus] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lineRes, pieRes] = await Promise.all([
          axios.get('http://localhost:8787/auth/line-data', {
            params: {
              startMonth,
              endMonth,
              barangayId: selectedLocation,
              incidentType
            }
          }),
          axios.get('http://localhost:8787/auth/pie-data', {
            params: {
              startMonth,
              endMonth,
              status,
              barangayId: selectedLocation,
              incidentType
            }
          })
        ]);

        setLineData(lineRes.data || []);
        setPieData(pieRes.data || []);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };

    fetchData();
  }, [startMonth, endMonth, status, selectedLocation, incidentType]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('http://localhost:8787/auth/Barangays');
        setLocations(res.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="reporting-container" style={{ marginLeft: '220px', flex: 1 }}>
        <div className="filters">
          <label>
            Start Month:
            <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </label>

          <label>
            End Month:
            <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </label>

          <label>
            Incident Type:
            <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
              <option value="">All Types</option>
              <option value="Animal Bite">Animal Bite</option>
              <option value="Missing Animal">Missing Animal</option>
              <option value="Animal Sighting">Animal Sighting</option>
            </select>
          </label>

          <label>
            Location:
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="chart-grid">
          <div className="chart-card">
            <h2 className="chart-title">Reports Over Time</h2>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', padding: '1rem' }}>No data available</p>
            )}
          </div>

          <div className="chart-card">
            <h2 className="chart-title">Reports by Type</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', padding: '1rem' }}>No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
