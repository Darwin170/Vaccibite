import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import './Sidebar.css'; 
import './ReportingSystem.css';

function ReportingPage() {
  const [reports, setReports] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState(null);
  const [statusUpdateFile, setStatusUpdateFile] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    type: '',
    barangayId: '',
    date: '',
    status: '',
    file: null,
  });

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:8787/auth/reports');
        setReports(res.data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBarangays = async () => {
      try {
        const res = await axios.get('http://localhost:8787/auth/Barangays');
        setBarangays(res.data);
      } catch (error) {
        console.error('Failed to fetch barangays:', error);
      }
    };

    fetchReports();
    fetchBarangays();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prevForm) => ({ ...prevForm, file: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    const { type, barangayId, date, status, file } = form;
    if (!type || !barangayId || !date || !status || !file) {
      alert('Please fill in all fields and upload a file.');
      return;
    }

    const formData = new FormData();
    formData.append('type', type);
    formData.append('barangayId', barangayId);
    formData.append('date', date);
    formData.append('status', status);
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8787/auth/Createreport', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ type: '', barangayId: '', date: '', status: '', file: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowForm(false);
      navigate('/map');
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const handleDelete = async (_id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axios.delete(`http://localhost:8787/auth/deleteReport/${_id}`);
      setReports((prev) => prev.filter((report) => report._id !== _id));
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    if (newStatus === 'Resolved') {
      setStatusUpdateModal({ reportId, newStatus });
    } else {
      const file = statusUpdateFile || null;
      updateReportStatus(reportId, newStatus, file);
    }
  };

  const updateReportStatus = async (reportId, newStatus, file = null) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      if (file) formData.append('file', file);

      await axios.put(`http://localhost:8787/auth/updateReportStatus/${reportId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatusUpdateModal(null);
      setStatusUpdateFile(null);

      if (newStatus === 'Resolved') {
        navigate('/resolution');
      } else {
        const updatedReports = await axios.get('http://localhost:8787/auth/reports');
        setReports(updatedReports.data);
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };

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

  const filteredReports = reports.filter((report) =>
    (typeFilter === '' || report.type === typeFilter) &&
    (statusFilter === '' || report.status === statusFilter)
  );

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="reporting-container" style={{ marginLeft: '220px', flex: 1 }}>
     
       

        <div className="actions-bar">
          <button className="add-report-btn" onClick={() => setShowForm(true)}>
            + Add Report
          </button>

          <div className="filters">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="Bite Incident">Bite Incident</option>
              <option value="Missing Animal">Missing Animal</option>
              <option value="Animal Sighting">Animal Sighting</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Submit a New Report</h2>

              <select name="type" value={form.type} onChange={handleInputChange}>
                <option value="">Select Incident Type</option>
                <option value="Bite Incident">Bite Incident</option>
                <option value="Missing Animal">Missing Animal</option>
                <option value="Animal Sighting">Animal Sighting</option>
              </select>

              <select name="barangayId" value={form.barangayId} onChange={handleInputChange}>
                <option value="">Select Barangay</option>
                {barangays.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>

              <input type="date" name="date" value={form.date} onChange={handleInputChange} />

              <select name="status" value={form.status} onChange={handleInputChange}>
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Resolved">Resolved</option>
              </select>

              <input type="file" ref={fileInputRef} onChange={handleFileChange} />
              {form.file && <p>Selected file: {form.file.name}</p>}

              <div className="modal-buttons">
                <button className="submit-btn" onClick={handleSubmit}>Submit</button>
                <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {statusUpdateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Upload File to Mark as Resolved</h2>
              <input type="file" onChange={(e) => setStatusUpdateFile(e.target.files[0])} />
              {statusUpdateFile && <p>Selected file: {statusUpdateFile.name}</p>}

              <div className="modal-buttons">
                <button className="submit-btn" onClick={() => {
                  if (!statusUpdateFile) {
                    alert("Please upload a file before resolving.");
                    return;
                  }
                  updateReportStatus(statusUpdateModal.reportId, statusUpdateModal.newStatus, statusUpdateFile);
                }}>Submit</button>
                <button className="cancel-btn" onClick={() => {
                  setStatusUpdateModal(null);
                  setStatusUpdateFile(null);
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {loading && <div className="loading">Loading...</div>}

        <div className="table-wrapper">
          <table className="reporting-table">
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
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report._id}>
                    <td>{report._id}</td>
                    <td>{report.type}</td>
                    <td>
                      {getBarangayName(report.barangayId)}<br />
                      <button onClick={() => handleViewMap(report.barangayId)} className="view-map-btn">📍 View on Map</button>
                    </td>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Resolved">Resolved</option>
                      </select>
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
                      ) : 'N/A'}
                    </td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(report._id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportingPage;
