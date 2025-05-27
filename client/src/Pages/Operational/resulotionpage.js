import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './ResolutionPage.css';

function ResolutionPage() {
  const [resolvedReports, setResolvedReports] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReportsAndBarangays = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/reports`);
        const resolved = res.data.filter(report => report.status === 'Resolved');
        setResolvedReports(resolved);

        const barangayRes = await axios.get(`${process.env.REACT_APP_API_URL}/auth/barangays`);
        setBarangays(barangayRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchReportsAndBarangays();
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

  return (
    <div className="reporting">
      <Sidebar />
      <div className="map-area" style={{ marginLeft: '220px' }}></div>
      <div className="resolution-container">
        <h1>✅ Resolved Reports</h1>

        {resolvedReports.length === 0 ? (
          <p>No resolved reports available.</p>
        ) : (
          <table className="resolved-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Barangay</th>
                <th>Date</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {resolvedReports.map((report) => (
                <tr key={report._id}>
                  <td>{report._id}</td>
                  <td>{report.type}</td>
                  <td>
                    {getBarangayName(report.barangayId)}<br />
                    <button onClick={() => handleViewMap(report.barangayId)} className="view-map-btn">
                      📍 View on Map
                    </button>
                  </td>
                  <td>{new Date(report.date).toLocaleDateString()}</td>
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
                    ) : (
                      'No File'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ResolutionPage;
