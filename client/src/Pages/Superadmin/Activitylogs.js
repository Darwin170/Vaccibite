import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Activitylogs.css';
import Sidebar from './Sidebar';

const roleOptions = [
    { value: 'All', label: 'All Roles' },
    { value: 'Mobile User', label: 'Barangay Representative' },
    { value: 'Admin', label: 'Admin' },
    { value: 'System_Admin', label: 'System Admin' },
];

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null);       

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true); 
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found. User is not authenticated.');
                    setError('Authentication token missing. Please log in.');
                    setIsLoading(false);
                    return;
                }

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/getLogs`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setLogs(response.data);
            } catch (err) {
                console.error('Error fetching logs:', err);
             
                setError('Failed to fetch activity logs. Check your network or server status.');
            } finally {
                setIsLoading(false); 
            }
        };

        fetchLogs();
      
    }, []);

    const filteredLogs = logs.filter((log) => {
        const userName = (log.user?.fullName || log.user?.name || '').toLowerCase();
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
            <Sidebar /><div style={{ marginLeft: "250px", padding: "20px" }}>
                <h2>Activity Logs</h2>
                {error && <p style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</p>}

                {isLoading ? (
                    <p>Loading activity logs...</p>
                ) : (
                    <>
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
                                {roleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
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
                                        <tr key={log.timestamp || index}> 
                                            <td className="tableCells">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td><td className="tableCells">{log.user?.fullName || log.user?.name || 'N/A'}</td><td className="tableCells">{log.user?.position || 'N/A'}</td><td className="tableCells">{log.action}</td><td className="tableCells">{log.details || 'N/A'}</td>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;



