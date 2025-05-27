import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BackupReports.css';
import Sidebar from './Sidebar';

const API_URL = process.env.REACT_APP_API_URL;

const BackupReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/reports`);
        setReports(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleBackupDownload = () => {
    const json = JSON.stringify(reports, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-backup-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="User-container">
      <Sidebar />
      <div className="main-content" style={{ marginLeft: '250px', padding: '20px' }}>
        <div className="backup-container">
          <h2 className="backup-heading">Backup Reports</h2>

          <button className="backup-download-button" onClick={handleBackupDownload}>
            📦 Download Backup
          </button>

          {loading ? (
            <p>Loading reports...</p>
          ) : reports.length > 0 ? (
            <table className="backup-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report._id}</td>
                    <td>{report.type}</td>
                    <td>{report.date ? new Date(report.date).toLocaleDateString() : 'No date'}</td>
                    <td>{report.status}</td>
                    <td>
                      {report.filePath ? (
                        <a
                          href={`${API_URL}/${report.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          {report.filePath.split('/').pop()}
                        </a>
                      ) : (
                        'No file'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No reports available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupReports;
