import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Sidebar.css';
import './ReportingSystem.css';



function ReportingPage() {
    const [reports, setReports] = useState([]);
    const [barangays, setBarangays] = useState([]); // Used for form dropdowns and map location
    const [typeFilter, setTypeFilter] = useState('');
    const [districtFilter, setDistrictFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true); // Set to true initially for first fetch
    const [error, setError] = useState(null); // For handling fetch errors
    const [statusUpdateModal, setStatusUpdateModal] = useState(null);
    const [statusUpdateFile, setStatusUpdateFile] = useState(null);
    const [selectedDetails, setSelectedDetails] = useState(null); // For the "View" modal
    const [searchTerm, setSearchTerm] = useState(''); // State for the search bar

    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Ref for clearing the file input

    // State for the Add Report form
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
                const reportsRes = await axios.get(`${process.env.REACT_APP_API_URL}/auth/reports`);
                setReports(reportsRes.data);

                // Fetch barangays
                const barangaysRes = await axios.get(`${process.env.REACT_APP_API_URL}/auth/Barangays`);
                setBarangays(barangaysRes.data);

            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []); // Empty dependency array means this runs once on component mount

    // --- Form Input Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setForm((prevForm) => {
            let newForm = { ...prevForm, [name]: value };

            // Special handling for barangayId: auto-set district
            if (name === 'barangayId') {
                const selectedBarangay = barangays.find(b => b._id === value);
                if (selectedBarangay) {
                    newForm.district = selectedBarangay.district;
                } else {
                    newForm.district = ''; // Reset if no barangay selected or found
                }
            }
            // Special handling for district filter: clear barangayId if district changes
            // This ensures that if a user changes the district, the barangay selection
            // is cleared as it's no longer valid for the new district.
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

    // --- Form Submission ---
    const handleSubmit = async () => {
        const { type, barangayId, district, date, status, file, categoryDetails } = form;

        // Basic validation
        if (!type || !barangayId || !district || !date || !status || !file) {
            alert('Please fill in all general fields and upload a file.');
            return;
        }

        const formData = new FormData();
        formData.append('type', type);
        formData.append('barangayId', barangayId);
        formData.append('district', district); // Ensure the dynamically set district is sent
        formData.append('date', date);
        formData.append('status', status);
        formData.append('file', file);
        formData.append('categoryDetails', JSON.stringify(categoryDetails)); // Send as JSON string

        try {
            await axios.post(`${API_URL}/auth/Createreport`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Reset form
            setForm({ type: '', barangayId: '', district: '', date: '', status: '', file: null, categoryDetails: {} });
            if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
            setShowForm(false); // Close the form modal

            // Re-fetch reports to update the table with the new entry
            const updatedReportsRes = await axios.get(`${process.env.REACT_APP_API_URL}/auth/reports`);
            setReports(updatedReportsRes.data);
            alert('Report created successfully!');
        } catch (error) {
            console.error('Failed to submit report:', error);
            alert('Failed to submit report. Please try again.');
        }
    };

    // --- Report Actions ---
    const handleDelete = async (_id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            await axios.delete(`${API_URL}/auth/deleteReport/${_id}`);
            // Update reports state by filtering out the deleted one
            setReports((prev) => prev.filter((report) => report._id !== _id));
            alert('Report deleted successfully!');
        } catch (error) {
            console.error('Failed to delete report:', error);
            alert('Failed to delete report. Please try again.');
        }
    };

    const handleStatusUpdate = async (reportId, newStatus) => {
        if (newStatus === 'Resolved') {
            // Open the modal for file upload if status is 'Resolved'
            setStatusUpdateModal({ reportId, newStatus });
        } else {
            // Update status directly for 'Pending' without file
            const file = null; // No file needed for "Pending"
            updateReportStatus(reportId, newStatus, file);
        }
    };

    const updateReportStatus = async (reportId, newStatus, file = null) => {
        try {
            const formData = new FormData();
            formData.append('status', newStatus);
            if (file) { // Only append file if it exists
                formData.append('file', file);
            }

            await axios.put(`${process.env.REACT_APP_API_URL}/auth/updateReportStatus/${reportId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }, // Important for FormData
            });

            // Close modal and clear file state
            setStatusUpdateModal(null);
            setStatusUpdateFile(null);

            if (newStatus === 'Resolved') {
                // Navigate to resolution page after successful resolution
                navigate('/resolution');
            } else {
                // Re-fetch reports to update the table if status changed to Pending
                const updatedReportsRes = await axios.get(`${process.env.REACT_APP_API_URL}/auth/reports`);
                setReports(updatedReportsRes.data);
                alert('Report status updated successfully!');
            }
        } catch (error) {
            console.error('Failed to update report status:', error);
            alert('Failed to update report status. Please try again.');
        }
    };

   
    // --- Map View Handler ---
    const handleViewMap = (barangayId) => {
        const barangay = barangays.find((b) => b._id === barangayId);
        if (barangay && barangay.latitude && barangay.longitude) {
            navigate(`/superior/map?lat=${barangay.latitude}&lng=${barangay.longitude}`);
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
                    <button className="add-report-btn" onClick={() => setShowForm(true)}>
                        + Add Report
                    </button>

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
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                {/* --- Add Report Form Modal --- */}
                {showForm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Submit a New Report</h2>

                            <select name="type" value={form.type} onChange={handleInputChange}>
                                <option value="">Select Incident Type</option>
                                <option value="Animal Bite">Animal Bite</option>
                                <option value="Missing Animal">Missing Animal</option>
                                <option value="Roaming Animal">Roaming Animal</option>
                            </select>

                            <select name="district" value={form.district} onChange={handleInputChange}>
                                <option value="">Select District</option>
                                {/* Populate with unique districts for the form */}
                                {Array.from(new Set(barangays.map(b => b.district)))
                                    .sort()
                                    .map(districtName => (
                                        <option key={districtName} value={districtName}>{districtName}</option>
                                    ))}
                            </select>

                            <select name="barangayId" value={form.barangayId} onChange={handleInputChange}>
                                <option value="">Select Barangay</option>
                                {/* Filter barangays based on selected district */}
                                {barangays
                                    .filter((b) => b.district === form.district)
                                    .map((b) => (
                                        <option key={b._id} value={b._id}>{b.name}</option>
                                    ))}
                            </select>

                            <input type="date" name="date" value={form.date} onChange={handleInputChange} />

                            <select name="status" value={form.status} onChange={handleInputChange}>
                                <option value="">Select Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Resolved">Resolved</option>
                            </select>

                            {/* Dynamic Category Details Input */}
                            <div className="category-details-section">
                                <h3>Category Specific Details:</h3>
                                {form.type === "Animal Bite" && (
                                    <>
                                        <input type="text" name="name" placeholder="Name" value={form.categoryDetails.name || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="animalType" placeholder="Animal Type" value={form.categoryDetails.animalType || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="color" placeholder="Color" value={form.categoryDetails.color || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="size" placeholder="Size" value={form.categoryDetails.size || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="location" placeholder="Bite Location" value={form.categoryDetails.location || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="severity" placeholder="Severity" value={form.categoryDetails.severity || ''} onChange={handleCategoryDetailsChange} />
                                        <select name="caughtStatus" value={form.categoryDetails.caughtStatus || ''} onChange={handleCategoryDetailsChange}>
                                            <option value="">Caught Status</option>
                                            <option value="Caught">Caught</option>
                                            <option value="Not Caught">Not Caught</option>
                                        </select>
                                    </>
                                )}
                                {form.type === "Roaming Animal" && (
                                    <>
                                        <input type="text" name="name" placeholder="Name (if known)" value={form.categoryDetails.name || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="animalType" placeholder="Animal Type" value={form.categoryDetails.animalType || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="color_breed" placeholder="Color/Breed" value={form.categoryDetails.color_breed || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="size" placeholder="Size" value={form.categoryDetails.size || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="location" placeholder="Sighting Location" value={form.categoryDetails.location || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="time" name="time" placeholder="Time of Sighting" value={form.categoryDetails.time || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="behavior" placeholder="Behavior" value={form.categoryDetails.behavior || ''} onChange={handleCategoryDetailsChange} />
                                    </>
                                )}
                                {form.type === "Missing Animal" && (
                                    <>
                                        <input type="text" name="name" placeholder="Pet's Name" value={form.categoryDetails.name || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="animalType" placeholder="Animal Type" value={form.categoryDetails.animalType || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="color_breed" placeholder="Color/Breed" value={form.categoryDetails.color_breed || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="size" placeholder="Size" value={form.categoryDetails.size || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="location" placeholder="Last Seen Location" value={form.categoryDetails.location || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="date" name="date" placeholder="Date Missing" value={form.categoryDetails.date || ''} onChange={handleCategoryDetailsChange} />
                                        <input type="text" name="special" placeholder="Special Identifying Marks/Details" value={form.categoryDetails.special || ''} onChange={handleCategoryDetailsChange} />
                                    </>
                                )}
                            </div>

                            <input type="file" ref={fileInputRef} onChange={handleFileChange} />
                            {form.file && <p>Selected file: {form.file.name}</p>}

                            <div className="modal-buttons">
                                <button className="submit-btn" onClick={handleSubmit}>Submit</button>
                                <button className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

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
                                        <p><strong>Name of the report:</strong> {selectedDetails.categoryDetails?.name || 'N/A'}</p>
                                        <p><strong>Animal Type:</strong> {selectedDetails.categoryDetails?.animalType || 'N/A'}</p>
                                        <p><strong>Color:</strong> {selectedDetails.categoryDetails?.color || 'N/A'}</p>
                                        <p><strong>Size:</strong> {selectedDetails.categoryDetails?.size || 'N/A'}</p>
                                        <p><strong>Location:</strong> {selectedDetails.categoryDetails?.location || 'N/A'}</p>
                                        <p><strong>Severity:</strong> {selectedDetails.categoryDetails?.severity || 'N/A'}</p>
                                        <p><strong>Caught Status:</strong> {selectedDetails.categoryDetails?.caughtStatus || 'N/A'}</p>
                                    </>
                                )}
                                {selectedDetails.type === "Roaming Animals" && (
                                    <>
                                        <p><strong>Name of the reporter:</strong> {selectedDetails.categoryDetails?.name || 'N/A'}</p>
                                        <p><strong>Animal Type:</strong> {selectedDetails.categoryDetails?.animalType || 'N/A'}</p>
                                        <p><strong>Color/Breed:</strong> {selectedDetails.categoryDetails?.color_breed || 'N/A'}</p>
                                        <p><strong>Size:</strong> {selectedDetails.categoryDetails?.size || 'N/A'}</p>
                                        <p><strong>Location:</strong> {selectedDetails.categoryDetails?.location || 'N/A'}</p>
                                        <p><strong>Time:</strong> {selectedDetails.categoryDetails?.time || 'N/A'}</p>
                                        <p><strong>Behavior:</strong> {selectedDetails.categoryDetails?.behavior || 'N/A'}</p>
                                    </>
                                )}
                                {selectedDetails.type === "Missing Animal" && (
                                    <>
                                        <p><strong>Name of the animal:</strong> {selectedDetails.categoryDetails?.name || 'N/A'}</p>
                                        <p><strong>Animal Type:</strong> {selectedDetails.categoryDetails?.animalType || 'N/A'}</p>
                                        <p><strong>Color/Breed:</strong> {selectedDetails.categoryDetails?.color_breed || 'N/A'}</p>
                                        <p><strong>Size:</strong> {selectedDetails.categoryDetails?.size || 'N/A'}</p>
                                        <p><strong>Location:</strong> {selectedDetails.categoryDetails?.location || 'N/A'}</p>
                                        <p><strong>Date Missing:</strong> {selectedDetails.categoryDetails?.date || 'N/A'}</p>
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
                                <th>ID</th>
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
                            {/* Render filtered reports */}
                            {filteredReports.length > 0 ? (
                                filteredReports.map((report) => (
                                    <tr key={report._id}>
                                        <td>{report._id}</td>
                                        <td>{report.type}</td>
                                        <td>
                                            {report.barangayName || 'N/A'}<br />
                                            {/* Pass report.barangayId to handleViewMap */}
                                            <button onClick={() => handleViewMap(report.barangayId)} className="view-map-btn">📍 View on Map</button>
                                        </td>
                                        <td>{report.district || 'N/A'}</td> {/* Display district here */}
                                        <td>{new Date(report.date).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                value={report.status}
                                                onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Resolved">Resolved</option>
                                            </select>
                                        </td>
                                        <td>
                                            {report.filePath ? (
                                                <a
                                                    href=`${process.env.REACT_APP_API_URL}/${report.filePath}`}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {report.filePath.split('/').pop()}
                                                </a>
                                            ) : 'N/A'}
                                        </td>
                                        <td>
                                            <button className="view-btn" onClick={() => setSelectedDetails(report)}>👁️ View</button>
                                            <button className="delete-btn" onClick={() => handleDelete(report._id)}>🗑️</button>
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

