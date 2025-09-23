import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Activitylogs.css';
import Sidebar from './Sidebar';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // ✅ Refactored fetchLogs to be inside useEffect and pass token
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found. User is not authenticated.');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getLogs`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ ADDED: Pass the token in the header
          },
        });
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this runs once on mount

  const filteredLogs = logs.filter((log) => {
    const userName = log.user?.name?.toLowerCase() || '';
    const userPosition = log.user?.position || '';
    const action = log.action?.toLowerCase() || '';

    const matchesSearch =
      userName.includes(searchTerm.toLowerCase()) ||
      action.includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All' || userPosition === roleFilter;

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
            <option value="All">All Roles</option>
            <option value="Mobile User">Mobile User</option>
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
                    {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="tableCells">{log.user?.name || 'N/A'}</td>
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