import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Sidebar.css';
import './ResolutionPage.css';

function ResolutionPage() {
  const [reports, setReports] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search input
  const [filterStatus, setFilterStatus] = useState('All'); // New state for status dropdown
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReportsAndBarangays = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/reports`);
        
        // Filter reports to only include 'Resolved' or 'Ongoing' initially, 
        // as per your original logic
        const initialFilteredReports = res.data.filter(
          report => report.status === 'Resolved' || report.status === 'Ongoing'
        );
        setReports(initialFilteredReports);

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
      navigate(`/Admin/map?lat=${barangay.latitude}&lng=${barangay.longitude}`);
    } else {
      alert("Barangay location not found.");
    }
  };


  const getFilteredReports = () => {
    return reports.filter((report) => {
      const matchesSearch = report.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'All' || report.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  };

  const displayReports = getFilteredReports();
  const availableStatuses = ['All', 'Resolved', 'Ongoing']; 



  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="resolution-container" style={{ marginLeft: '300px', marginTop: '25px', flex: 1 }}>
        <h2>Report History</h2>

 
        <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
          
          <input
            type="text"
            placeholder="Search by Report Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
          />

          <label htmlFor="status-filter">Filter by Status:</label>
          
          <select
             id="status-filter"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
             style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '150px' }}
          >
             <option value="All">All</option>
             {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
             ))}
          </select>
        </div>
        


        {displayReports.length === 0 ? (
          <p>No matching resolved or investigation reports found.</p>
        ) : (
          <table className="resolved-table">
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
              {displayReports.map((report) => (
                <tr key={report._id}>
                  <td>{report.reportId}</td>
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
                    <span className={`status-badge ${report.status.toLowerCase()}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>
                           {report.filePath ? (
                               <a
                                href={`${process.env.REACT_APP_API_URL}/${report.filePath}`}
                                  target="_blank"
                                          rel="noopener noreferrer"
                                                  
                                        >
                                        {report.filePath.split('/').pop()}
                                       </a>
                                      ) : (
                                                'N/A'
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





