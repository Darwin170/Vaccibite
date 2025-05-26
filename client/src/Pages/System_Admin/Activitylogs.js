import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ActivityLogs.css';
import Sidebar from './Sidebar';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8787/auth/getLogs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8787/auth/deleteLog/${id}`);
      fetchLogs(); 
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
       <div className="User-container">
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "20px" }}></div>
      <div className="container">
      <h2>Activity Logs</h2>
      <table className="table">
        <thead>
          <tr>
            <th className="tableHeader">Timestamp</th>
            <th className="tableHeader">Username</th>
            <th className="tableHeader">Position</th>
            <th className="tableHeader">Action</th>
            <th className="tableHeader">Details</th>
            <th className="tableHeader">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td className="tableCell">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="tableCell">{log.user?.name || 'N/A'}</td>
              <td className="tableCell">{log.user?.position || 'N/A'}</td>
              <td className="tableCell">{log.action}</td>
              <td className="tableCell">{log.details || 'N/A'}</td>
              <td className="tableCell">
                <button
                  onClick={() => handleDelete(log._id)}
                  className="deleteButton"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  
  );
};

export default ActivityLogs;
