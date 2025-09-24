import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BackupReports.css';
import Sidebar from './Sidebar';

const BackupReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false); // New state for download status

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/reports`);
                setReports(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleJSONDownload = () => {
        const json = JSON.stringify(reports, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-backup-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // New handler function for PDF download
    const handlePDFDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await axios.get(
                ` ${process.env.REACT_APP_API_URL}/auth/pdf-backup`,
                { responseType: 'blob' } // Crucial for receiving binary data
            );
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report-backup-${new Date().toISOString()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download PDF backup:', error);
            alert('Failed to download PDF backup. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="User-container">
            <Sidebar />
            <div className="main-content" style={{ marginLeft: '250px', padding: '20px' }}>
                <div className="backup-container">
                    <h2 className="backup-heading">Backup Reports</h2>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button className="backup-download-button" onClick={handleJSONDownload}>
                            📦 Download JSON
                        </button>
                        <button 
                            className="backup-download-button" 
                            onClick={handlePDFDownload}
                            disabled={isDownloading} // Disable while downloading
                        >
                           {isDownloading ? 'Downloading...' : '📄 Download PDF'}
                        </button>
                    </div>

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
                                        <td>{report.reportId}</td>
                                        <td>{report.type}</td>
                                        <td>{report.date ? new Date(report.date).toLocaleDateString() : 'No date'}</td>
                                        <td>{report.status}</td>
                                        <td>
                                            {report.filePath ? (
                                                <a
                                                    href={` ${process.env.REACT_APP_API_URL}/${report.filePath}`}
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

