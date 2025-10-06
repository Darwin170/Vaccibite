import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ActivityLogs.css';
import Sidebar from './Sidebar';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getLogs`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
  const userPosition = log.user?.position || '';

  // 1. Hardcoded Exclusion
  if (userPosition === 'Super_Admin') {
    return false; // Exclude Super Admin logs immediately
  }

  // 2. Existing Search and Role Filter Logic
  const userName = (log.user?.fullName || log.user?.name || '').toLowerCase();
  const action = log.action?.toLowerCase() || '';

  const matchesSearch =
    userName.includes(searchTerm.toLowerCase()) ||
    action.includes(searchTerm.toLowerCase());

  const matchesRole =
    roleFilter === 'All' || userPosition === roleFilter;

  return matchesSearch && matchesRole;
});

  return (
    <div className="Activity">
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "20px" }}>
        <h2>Activity Logs</h2>

        
        <div className="controls" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search by username or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', width: '250px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="">All Roles</option>
            <option value="mobile">Mobile User</option>
            <option value="Admin">Admin</option>
            <option value="System_Admin">System Admin</option>
          </select>
        </div>

        <table className="tables">
          <thead>
            <tr>
              <th className="tableHeaders">Timestamp</th>
              <th className="tableHeaders">Username</th>
              <th className="tableHeaders">Position</th>
              <th className="tableHeaders">Action</th>
              <th className="tableHeaders">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <tr key={index}>
                  <td className="tableCells">
                    {new Date(log.timestamp).toLocaleString()}</td> 
                 <td className="tableCells">{log.user?.fullName || log.user?.name || 'N/A'}</td>
                  <td className="tableCells">{log.user?.position || 'N/A'}</td>
                  <td className="tableCells">{log.action}</td>
                  <td className="tableCells">{log.details || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="tableCells" colSpan="5" style={{ textAlign: 'center' }}>
                  No matching logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogs;








