import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Sidebar.css';
import './ReportingSystem.css';
import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL;        
const socket = io(process.env.REACT_APP_API_URL);

function ReportingPage() {
    const [reports, setReports] = useState([]);
    const [barangays, setBarangays] = useState([]); 
    const [typeFilter, setTypeFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [statusUpdateModal, setStatusUpdateModal] = useState(null);
    const [statusUpdateFile, setStatusUpdateFile] = useState(null);
    const [selectedDetails, setSelectedDetails] = useState(null); // For the "View" modal
    const [searchTerm, setSearchTerm] = useState(''); // State for the search bar

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    
    const [form, setForm] = useState({
        type: '',
        barangayId: '',
        district: '', 
        date: '',
        status: '',
        file: null,
        categoryDetails: {},
    });

    // --- Data Fetching useEffect ---
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch reports
                const reportsRes = await axios.get(`${API_URL}/auth/reports`);
                setReports(reportsRes.data);

                // Fetch barangays
                const barangaysRes = await axios.get(`${API_URL}/auth/Barangays`);
                setBarangays(barangaysRes.data);

            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []); 


    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setForm((prevForm) => {
            let newForm = { ...prevForm, [name]: value };

            if (name === 'barangayId') {
                const selectedBarangay = barangays.find(b => b._id === value);
                if (selectedBarangay) {
                    newForm.district = selectedBarangay.district;
                } else {
                    newForm.district = '';
                }
            }
            
            if (name === 'district' && prevForm.district !== value) {
                newForm.barangayId = '';
            }

            return newForm;
        });
    };

    const handleCategoryDetailsChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            categoryDetails: {
                ...prevForm.categoryDetails,
                [name]: value,
            },
        }));
    };

    const handleFileChange = (e) => {
        setForm((prevForm) => ({ ...prevForm, file: e.target.files[0] }));
    };

    // --- Search Bar Handler ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const { type, barangayId, district, date, status, file, categoryDetails } = form;

        const formData = new FormData();
        formData.append('type', type);
        formData.append('barangayId', barangayId);
        formData.append('district', district); // Ensure the dynamically set district is sent
        formData.append('date', date);
        formData.append('status', status);
        formData.append('file', file);
        formData.append('categoryDetails', JSON.stringify(categoryDetails)); // Send as JSON string

      

    // --- Report Actions ---
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            await axios.delete(`${API_URL}/auth/deleteReport/${id}`,
                {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                }
            );
            // Update reports state by filtering out the deleted one
            setReports((prev) => prev.filter((report) => report._id !== id));
            alert('Report deleted successfully!');
        } catch (error) {
            console.error('Failed to delete report:', error);
            alert('Failed to delete report. Please try again.');
        }
    };

    const handleStatusUpdate = async (reportId, newStatus,file) => {
        if (newStatus === 'Resolved') {
            // Open the modal for file upload if status is 'Resolved'
            setStatusUpdateModal({ reportId, newStatus,file });
        } else {
             
             const file = null; // No file needed for "Pending"
            updateReportStatus(reportId, newStatus, file);
            
        }
    };

   
const updateReportStatus = async (reportId, newStatus, file = null) => {
    try {
        let response;
        const url = `${API_URL}/auth/updateReportStatus/${reportId}`;
        const token = localStorage.getItem("token");

        if (file) {
            const formData = new FormData();
            formData.append("status", newStatus);
            formData.append("file", file); // ✅ Assuming your server expects 'file' as the key

            response = await axios.put(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
        } else {
            response = await axios.put(url, { status: newStatus }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
        }

            // Reset modal state
            setStatusUpdateModal(null);
            setStatusUpdateFile(null);

            if (newStatus === "Resolved") {
                navigate("/Admin/resolution");
            } else if (newStatus === "Ongoing") {
                navigate("/Admin/Report");
                window.location.reload();
            } else {
                const updatedReportsRes = await axios.get(`${API_URL}/auth/reports`);
                setReports(updatedReportsRes.data);
                alert("Report status updated successfully!");
            }
         
    } catch (error) {
        console.error("Failed to update report status:", error);
        alert("Failed to update report status. Please try again.");
    }
};

    const handleDownload = (id) => {
     window.open(`${API_URL}/auth/${id}/download`, "_blank");
        };

   
    // --- Map View Handler ---
    const handleViewMap = (barangayId) => {
        const barangay = barangays.find((b) => b._id === barangayId);
        if (barangay && barangay.latitude && barangay.longitude) {
            navigate(`/Admin/map?lat=${barangay.latitude}&lng=${barangay.longitude}`);
        } else {
            alert("Barangay location not found or invalid coordinates.");
        }
    };

    // --- Combined Filtering Logic ---
    const filteredReports = reports.filter((report) => {
        // 1. Apply Search Term Filter (case-insensitive)
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const matchesSearchTerm =
            report.type.toLowerCase().includes(lowerCaseSearchTerm) ||
            (report.barangayName && report.barangayName.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (report.district && report.district.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (report.status && report.status.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (report._id && report._id.toLowerCase().includes(lowerCaseSearchTerm)); // Search by ID too

        // 2. Apply Type Filter
        const matchesType = typeFilter === '' || report.type === typeFilter;

        // 3. Apply District Filter
        const matchesDistrict = districtFilter === '' || (report.district && report.district === districtFilter);

        // 4. Apply Status Filter
        const matchesStatus = statusFilter === '' || report.status === statusFilter;

        // A report must satisfy ALL active filters to be displayed
        return matchesSearchTerm && matchesType && matchesDistrict && matchesStatus;
    });

    // --- Loading and Error States ---
    if (loading) {
        return <div className="loading">Loading reports...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }
    
    // --- Render JSX ---
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar /> {/* Your Sidebar Component */}
            <div className="reporting-container" style={{ marginLeft: '220px', flex: 1 }}>
            <div className="actions-bar">
                
                    {/* Search Bar Input */}
                    <div className="search-bar-container">
                        <input
                            type="text"
                            placeholder="Search reports by type, barangay, district, or status..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="filters">
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="">All Types</option>
                            <option value="Animal Bite">Animal Bite</option>
                            <option value="Missing Animal">Missing Animal</option>
                            <option value="Roaming Animal">Roaming Animal</option>
                        </select>

                        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
                            <option value="">All Districts</option>
                            {/* Populate with unique districts from fetched barangays */}
                            {Array.from(new Set(barangays.map(b => b.district)))
                                .sort() // Optional: sort districts alphabetically
                                .map(districtName => (
                                    <option key={districtName} value={districtName}>{districtName}</option>
                                ))}
                        </select>

                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                </div>

              

                {/* --- View Details Modal --- */}
                {selectedDetails && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Report Details</h2>
                            <p><strong>ID:</strong> {selectedDetails._id}</p>
                            <p><strong>Type:</strong> {selectedDetails.type}</p>
                            {/* Display barangayName directly from the report object, as it's populated now */}
                            <p><strong>Barangay:</strong> {selectedDetails.barangayName || 'N/A'}</p>
                            <p><strong>District:</strong> {selectedDetails.district || 'N/A'}</p>
                            <p><strong>Date:</strong> {new Date(selectedDetails.date).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {selectedDetails.status}</p>
                            {selectedDetails.filePath && (
                                <p>
                                    <strong>File:</strong>{' '}
                                    <a
                                        href={`${API_URL}/${selectedDetails.filePath}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {selectedDetails.filePath.split('/').pop()}
                                    </a>
                                </p>
                            )}
                            <hr />
                            <h3>Category Details:</h3>
                            <div>
                                {/* Render category details based on type */}
                                {selectedDetails.type === "Animal Bite" && (
                                    <>
                                        <p><strong>Name of the report:</strong> {selectedDetails.categoryDetails?.Name_of_the_barangay_officer || 'N/A'}</p>
                                        <p><strong>Barangay:</strong> {selectedDetails.categoryDetails?.barangayId || 'N/A'}</p>
                                        <p><strong>Name of the bitten person:</strong> {selectedDetails.categoryDetails?.Name_Of_the_bitten_Person || 'N/A'}</p>
                                        <p><strong>Animal Type:</strong> {selectedDetails.categoryDetails?.animalType || 'N/A'}</p>
                                        <p><strong>Color:</strong> {selectedDetails.categoryDetails?.color || 'N/A'}</p>
                                        <p><strong>Size:</strong> {selectedDetails.categoryDetails?.size || 'N/A'}</p>
                                        <p><strong>Location:</strong> {selectedDetails.categoryDetails?.location || 'N/A'}</p>
                                        <p><strong>Location of the bite:</strong> {selectedDetails.categoryDetails?.location_of_bite || 'N/A'}</p>
                                        <p><strong>Street:</strong> {selectedDetails.categoryDetails?.street || 'N/A'}</p>
                                        <p><strong>Age:</strong> {selectedDetails.categoryDetails?.age || 'N/A'}</p>
                                        <p><strong>Gender:</strong> {selectedDetails.categoryDetails?.gender || 'N/A'}</p>
                                        <p><strong>Severity:</strong> {selectedDetails.categoryDetails?.severity || 'N/A'}</p>
                                        <p><strong>Caught Status:</strong> {selectedDetails.categoryDetails?.caughtStatus || 'N/A'}</p>
                                    </>
                                )}
                                {selectedDetails.type === "Roaming Animals" && (
                                    <>
                                        <p><strong>Name of the reporter:</strong> {selectedDetails.categoryDetails?.Name_of_the_barangay_officer || 'N/A'}</p>
                                        <p><strong>Barangay:</strong> {selectedDetails.categoryDetails?.barangayId || 'N/A'}</p>
                                        <p><strong>Animal Type:</strong> {selectedDetails.categoryDetails?.animalType || 'N/A'}</p>
                                        <p><strong>Color:</strong> {selectedDetails.categoryDetails?.color || 'N/A'}</p>
                                        <p><strong>Breed of the dog:</strong> {selectedDetails.categoryDetails?.breed || 'N/A'}</p>
                                        <p><strong>Size:</strong> {selectedDetails.categoryDetails?.size || 'N/A'}</p>
                                        <p><strong>District:</strong> {selectedDetails.categoryDetails?.location || 'N/A'}</p>
                                        <p><strong>Time:</strong> {selectedDetails.categoryDetails?.Time || 'N/A'}</p>
                                        <p><strong>Behavior:</strong> {selectedDetails.categoryDetails?.behavior || 'N/A'}</p>
                                    </>
                                )}
                                {selectedDetails.type === "Missing Animal" && (
                                    <>
                                        <p><strong>Name of the animal:</strong> {selectedDetails.categoryDetails?.Name_of_the_barangay_officer || 'N/A'}</p>
                                        <p><strong>Barangay:</strong> {selectedDetails.categoryDetails?.barangayId || 'N/A'}</p>
                                        <p><strong>Name of the missing animal:</strong> {selectedDetails.categoryDetails?.Name_of_the_animal_missing || 'N/A'}</p>
                                        <p><strong>Animal Type:</strong> {selectedDetails.categoryDetails?.animalType || 'N/A'}</p>
                                        <p><strong>Color:</strong> {selectedDetails.categoryDetails?.color || 'N/A'}</p>
                                        <p><strong>Breed:</strong> {selectedDetails.categoryDetails?.breed || 'N/A'}</p>
                                        <p><strong>Size:</strong> {selectedDetails.categoryDetails?.size || 'N/A'}</p>
                                        <p><strong>District:</strong> {selectedDetails.categoryDetails?.location || 'N/A'}</p>
                                        <p><strong>Date Missing:</strong> {selectedDetails.categoryDetails?.reportDate || 'N/A'}</p>
                                        <p><strong>Special:</strong> {selectedDetails.categoryDetails?.special || 'N/A'}</p>
                                    </>
                                )}
                            </div>
                            <div className="modal-buttons">
                                <button className="cancel-btn" onClick={() => setSelectedDetails(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Status Update Modal --- */}
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

                {/* --- Reports Table --- */}
                <div className="table-wrapper">
                    <table className="reporting-table">
                        <thead>
                            <tr>
                                <th>report ID</th>
                                <th>Type</th>
                                <th>Barangay</th>
                                <th>District</th>
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
                                        <td>{report.reportId}</td>
                                        <td>{report.type}</td>
                                        <td>
                                            {report.barangayName || 'N/A'}<br />
                                           
                                            <button onClick={() => handleViewMap(report.barangayId)} className="view-map-btn">📍 View on Map</button>
                                        </td>
                                        <td>{report.district || 'N/A'}</td>
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
                                                  href={report.filePath}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  download={report.filePath.split('/').pop()} // optional
                                                >
                                                  {report.filePath.split('/').pop()}
                                                </a>
                                              ) : (
                                                'N/A'
                                              )}
                                        </td>
                                        <td>
                                            <button className="view-btn" onClick={() => setSelectedDetails(report)}>👁️ View</button>
                                            <button className="delete-btn" onClick={() => handleDelete(report._id)}>🗑️</button>
                                            <button className="download-btn"  onClick={() => handleDownload(report._id)}>Download PDF</button>

                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8">No reports found matching your criteria.</td>
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










