import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // ✅ Import Sidebar
import './Sidebar.css'; // ✅ Sidebar styles
import './ResolutionPage.css';

function ResolutionPage() {
  const [resolvedReports, setResolvedReports] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReportsAndBarangays = async () => {
      try {
        const res = await axios.get('http://localhost:8787/auth/reports');
        const resolved = res.data.filter(report => report.status === 'Resolved');
        setResolvedReports(resolved);

        const barangayRes = await axios.get('http://localhost:8787/auth/barangays');
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
      navigate(`/superior/map?lat=${barangay.latitude}&lng=${barangay.longitude}`);
    } else {
      alert("Barangay location not found.");
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="resolution-container" style={{ marginLeft: '300px', marginTop: '25px', flex: 1 }}>


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
                    {getBarangayName(report.barangayId)}
                    <br />
                    <button onClick={() => handleViewMap(report.barangayId)} className="view-map-btn">
                      📍 View on Map
                    </button>
                  </td>
                  <td>{new Date(report.date).toLocaleDateString()}</td>
                  <td>
                    {report.filePath ? (
                      <a
                        href={`http://localhost:8787/${report.filePath}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {report.filePath.split('/').pop()}
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
