import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import './Sidebar.css';
import Sidebar from './Sidebar';
import axios from 'axios';
import { FaBell } from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { useNavigate } from "react-router-dom";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

const Dashboard = () => {
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filteredBarangays, setFilteredBarangays] = useState([]);
  const [newReportsCount, setNewReportsCount] = useState(0);
  const [reportsLast28Days, setReportsLast28Days] = useState(0);
  const navigate = useNavigate();
  const [eventViewsCount, setEventViewsCount] = useState(0);
  const [resolvedReportsCount, setResolvedReportsCount] = useState(0);
  const [ongoingReportsCount, setOngoingReportsCount] = useState(0); 
  const [startMonth, setStartMonth] = useState('1');
  const [endMonth, setEndMonth] = useState('12');
  const [status, setStatus] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');

  useEffect(() => {
    if (selectedDistrict) {
      const filtered = locations.filter(loc => loc.district === selectedDistrict);
      setFilteredBarangays(filtered);

      const isSelectedBarangayInNewList = filtered.some(loc => loc._id === selectedBarangay);
      if (!isSelectedBarangayInNewList) {
        setSelectedBarangay('');
      }
    } else {
      setFilteredBarangays(locations);
    }
  }, [selectedDistrict, locations, selectedBarangay]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const params = {
          startMonth,
          endMonth,
          status,
          incidentType,
          district: selectedDistrict,
          barangayId: selectedBarangay,
        };

        const [lineRes, pieRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/auth/line-data`, { params }),
          axios.get(`${process.env.REACT_APP_API_URL}/auth/pie-data`, { params }),
        ]);

        setLineData(lineRes.data || []);
        setPieData(pieRes.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, [startMonth, endMonth, status, incidentType, selectedDistrict, selectedBarangay]);

  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/Barangays`);
        setLocations(res.data || []);
        setFilteredBarangays(res.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  
  useEffect(() => {
    const checkNewReports = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/new-report`);
        setNewReportsCount(res.data.count || 0);
      } catch (error) {
        console.error("Error checking new reports:", error);
      }
    };

    const fetchReportsLast28Days = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getreport28days`);
        setReportsLast28Days(res.data.count || 0);
      } catch (error) {
        console.error("Error fetching last 28 days reports:", error);
      }
    };

    const fetchResolvedReports = async () => {
      try {
        const params = {
          startMonth,
          endMonth,
          incidentType,
          district: selectedDistrict,
          barangayId: selectedBarangay,
        };
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/resolved-reports`, { params });
        setResolvedReportsCount(res.data.count || 0);
      } catch (error) {
        console.error("Error fetching resolved reports:", error);
      }
    };

    const fetchOngoingReports = async () => { 
      try {
        const params = {
          startMonth,
          endMonth,
          incidentType,
          district: selectedDistrict,
          barangayId: selectedBarangay,
        };
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth//getOngoingReport`, { params }); // Assuming this new endpoint exists
        setOngoingReportsCount(res.data.count || 0);
      } catch (error) {
        console.error("Error fetching ongoing reports:", error);
      }
    };

    const fetchEventViews = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/event-views`);
        setEventViewsCount(res.data.count || 0); 
      } catch (error) {
        console.error("Error fetching event views:", error);
      }
    };

  
    checkNewReports();
    fetchReportsLast28Days();
    fetchResolvedReports();
    fetchOngoingReports(); 
    fetchEventViews();

    const interval = setInterval(() => {
      checkNewReports();
      fetchReportsLast28Days();
      fetchResolvedReports();
      fetchOngoingReports(); 
      fetchEventViews();
    }, 10000);

    return () => clearInterval(interval);
  }, [startMonth, endMonth, incidentType, selectedDistrict, selectedBarangay]);

  const getSummaryText = () => {
    const filters = [];
    if (selectedBarangay) {
      const barangayName = filteredBarangays.find(b => b._id === selectedBarangay)?.name;
      if (barangayName) filters.push(` of ${barangayName}`);
    } else if (selectedDistrict) {
      filters.push(`all barangays in District ${selectedDistrict}`);
    }
    if (incidentType) {
      filters.push(`${incidentType.toLowerCase()}`);
    }
    if (status) {
      filters.push(` ${status.toLowerCase()} reports and`);
    }
    if (startMonth && endMonth) {
      const start = new Date(0, parseInt(startMonth) - 1).toLocaleString('default', { month: 'long' });
      const end = new Date(0, parseInt(endMonth) - 1).toLocaleString('default', { month: 'long' });
      if (start === end) {
        filters.push(`for the month of ${start}`);
      } else {
        filters.push(`from ${start} to ${end}`);
      }
    }

    if (filters.length === 0) {
      return "Showing statistic.";
    }

    return `Showing statistic ${filters.join(' ')}`;
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="dashboard-container" style={{ marginLeft: '220px', flex: 1 }}>

        
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
          <button
            onClick={() => navigate("/Admin/Report")}
            style={{ position: "relative", background: "none", border: "none", cursor: "pointer" }}
          >
            <FaBell size={24} />
            {newReportsCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "12px"
              }}>
                {newReportsCount}
              </span>
            )}
          </button>
        </div>

       
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
              <option value="Ongoing">Ongoing</option>
              <option value="Resolved">Resolved</option>
            </select>
          </label>

          <label>
            Incident Type:
            <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
              <option value="">All Types</option>
              <option value="Animal Bite">Animal Bite</option>
              <option value="Missing Animal">Missing Animal</option>
              <option value="Animal Roaming">Animal Roaming</option>
            </select>
          </label>

          <label>
            District:
            <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
              <option value="">All Districts</option>
              {[...new Set(locations.map(b => b.district))].sort().map(district => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>

          <label>
            Location (Barangay):
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
            >
              <option value="">All Barangays</option>
              {filteredBarangays.map((loc) => (
                <option key={loc._id} value={loc._id}>{loc.name}</option>
              ))}
            </select>
          </label>
        </div>
      
        <div className="Summary">
          <p>{getSummaryText()}</p>
        </div>
       
        <div className="chart-grid">
          
          <div className="chart-card">
            <h2 className="chart-title">📊 Reports in the Last 28 Days</h2>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
              <span style={{ fontSize: "85px", fontWeight: "bold", color: "#2563eb" }}>
                {reportsLast28Days}
              </span>
            </div>
          </div>

          
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
                  <Line type="monotone" dataKey="count" stroke="#02010cff" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', padding: '1rem' }}>No data available</p>
            )}
          </div>
          
          <div className="chart-card">
            <h2 className="chart-title">✅ Reports Resolved</h2>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
              <span style={{ fontSize: "85px", fontWeight: "bold", color: "#16a34a" }}>
                {resolvedReportsCount}
              </span>
            </div>
          </div>
          
         
          <div className="chart-card">
            <h2 className="chart-title">🚨 Ongoing Reports</h2>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
              <span style={{ fontSize: "85px", fontWeight: "bold", color: "#eab308" }}>
                {ongoingReportsCount}
              </span>
            </div>
          </div>

         
          <div className="chart-card">
            <h2 className="chart-title">👁️ Event Views</h2>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
              <span style={{ fontSize: "85px", fontWeight: "bold", color: "#f59e0b" }}>
                {eventViewsCount}
              </span>
            </div>
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



