import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReportingSystem.css';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

function ReportingPage() {
  const [reports, setReports] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/reports`);
      setReports(res.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarangays = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/Barangays`);
      setBarangays(res.data);
    } catch (error) {
      console.error('Failed to fetch barangays:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchBarangays();
  }, []);

  const getBarangayName = (barangayId) => {
    const barangay = barangays.find((b) => b._id === barangayId);
    return barangay ? barangay.name : 'Unknown';
  };

  const handleViewMap = (barangayId) => {
    const barangay = barangays.find((b) => b._id === barangayId);
    if (barangay) {
      navigate(`/operational/map?lat=${barangay.latitude}&lng=${barangay.longitude}`);
    } else {
      alert("Barangay location not found.");
    }
  };

  const filteredReports = reports.filter((report) =>
    (typeFilter === '' || report.type === typeFilter) &&
    (statusFilter === '' || report.status === statusFilter)
  );

  return (
    <div className="reporting">
      <Sidebar />
      <div className="reporting-container">
        <div className="actions-bar">
          <div className="filters">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="Bite Incident">Bite Incident</option>
              <option value="Missing Animal">Missing Animal</option>
              <option value="Animal Sighting">Animal Sighting</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading && <div className="loading">Loading...</div>}

        <div className="table-wrapper">
          <table className="reporting-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Barangay</th>
                <th>Date</th>
                <th>Status</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td>{report._id}</td>
                    <td>{report.type}</td>
                    <td>
                      {getBarangayName(report.barangayId)}<br />
                      <button onClick={() => handleViewMap(report.barangayId)} className="view-map-btn">View on Map</button>
                    </td>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>{report.status}</td>
                    <td>
                      {report.filePath ? (
                        <a
                          href={`${process.env.REACT_APP_API_URL}/${report.filePath}`}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {decodeURIComponent(report.filePath.split('/').pop())}
                        </a>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7">No reports found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportingPage;
