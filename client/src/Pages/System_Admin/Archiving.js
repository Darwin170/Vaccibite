import React, { useEffect, useState } from 'react';
import './ArchiveReports.css';
import axios from 'axios';
import Sidebar from './Sidebar';

const ArchivedReports = () => {
  const [reports, setReports] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArchivedReports = async () => {
    try {
      const archivedRes = await axios.get('http://localhost:8787/auth/archived');
      setReports(Array.isArray(archivedRes.data) ? archivedRes.data : []);

      const barangayRes = await axios.get('http://localhost:8787/auth/barangays');
      setBarangays(barangayRes.data);
    } catch (error) {
      console.error('Failed to fetch archived reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedReports();
  }, []);

  const handleRetrieve = async (id) => {
    try {
      const response = await fetch(`http://localhost:8787/auth/retrieve/${id}`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Report successfully retrieved.');
        setReports((prev) => prev.filter((report) => report._id !== id));
      } else {
        alert('Failed to retrieve the report.');
      }
    } catch (error) {
      console.error('Error retrieving report:', error);
      alert('Server error.');
    }
  };

  const getBarangayName = (id) => {
    const found = barangays.find((b) => b._id === id);
    return found ? found.name : 'Unknown';
  };



  

  if (loading) return <div>Loading archived reports...</div>;

  return (
     <div className="User-container">
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "20px" }}></div>
    <div className="container">
      <h2 className="heading">Archived Reports</h2>
      {reports.length > 0 ? (
        <table className="archive-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Barangay</th>
              <th>Date</th>
              <th>Status</th>
              <th>File</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td>{report._id}</td>
                <td>{report.type}</td>
                <td>
                  {getBarangayName(report.barangayId)} 
                </td>
                <td>
                  {report.date
                    ? new Date(report.date).toLocaleDateString()
                    : 'No date'}
                </td>
                <td>
                 {report.status}
                </td>
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
                    'No file'
                  )}
                </td>
                <td>
                  <button
                    className="retrieve-button"
                    onClick={() => handleRetrieve(report._id)}
                  >
                    retrieve
                  </button>
                  <button
                    className="retrieve-button"
                    onClick={() => handleRetrieve(report._id)}
                  >
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No archived reports found.</p>
      )}
    </div>
  </div>  
  );
};

export default ArchivedReports;
