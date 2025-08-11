import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import Sidebar from './Sidebar';

import './BarangayMap.css';
import './Sidebar.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon issues with Webpack using modern import syntax
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// A hook to parse URL query parameters
const useQuery = () => new URLSearchParams(useLocation().search);

// A component to handle map size invalidation.
// This is crucial for fixing the fragmented tile issue after the component is rendered.
const MapInitializer = () => {
    const map = useMap();
    useEffect(() => {
        // Invalidate the map size after the component mounts to ensure it renders correctly
        map.invalidateSize();

        // Also add a resize listener to handle window resizing
        const handleResize = () => {
            map.invalidateSize();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [map]);
    return null;
};

// A component to fly to a specific location on the map
const FlyToLocation = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        // Only fly if coordinates are valid numbers
        if (!isNaN(lat) && !isNaN(lng)) {
            map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
        }
    }, [lat, lng, map]);
    return null;
};

// Function to determine the color of the circle based on report types
const getBarangayColor = (reportsInBarangay) => {
    const hasBite = reportsInBarangay.some(r => r.type === 'Animal Bite');
    const hasMissing = reportsInBarangay.some(r => r.type === 'Missing Animal');
    const hasRoaming = reportsInBarangay.some(r => r.type === 'Roaming Animal');

    if (hasBite) return 'red';
    if (hasMissing) return 'orange';
    if (hasRoaming) return 'blue';
    return 'gray';
};

const MapPage = () => {
    const navigate = useNavigate();
    const query = useQuery();
    const latParam = parseFloat(query.get('lat'));
    const lngParam = parseFloat(query.get('lng'));

    const [barangays, setBarangays] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true); // Set to true initially
    const [typeFilter, setTypeFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

 

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch both barangays and reports in parallel for efficiency
                const [barangayRes, reportsRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/auth/Barangays`),
                    axios.get(`${process.env.REACT_APP_API_URL}/auth/reports`)
                ]);

                // Map the reports to include the barangay name for easier filtering and display
                const fetchedBarangays = barangayRes.data;
                const reportsWithBarangayName = reportsRes.data.map(report => {
                    const barangay = fetchedBarangays.find(b => b._id === report.barangayId);
                    return { ...report, barangayName: barangay?.name || 'N/A' };
                });

                setBarangays(fetchedBarangays);
                setReports(reportsWithBarangayName);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data. Please check the server connection.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); // Empty dependency array to run only once on component mount

    const handleViewMap = (barangayId) => {
        const barangay = barangays.find(b => b._id === barangayId);
        if (barangay && !isNaN(barangay.latitude) && !isNaN(barangay.longitude)) {
            navigate(`/superior/map?lat=${barangay.latitude}&lng=${barangay.longitude}`);
        } else {
            // Using a custom modal or message box is better than alert
            // For now, we'll use a simple alert as a placeholder
            alert("Barangay location not found or invalid coordinates.");
        }
    };

    const filteredReports = reports.filter((report) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        // Use the pre-populated barangayName for search
        const matchesSearchTerm =
            report._id.toLowerCase().includes(lowerCaseSearchTerm) ||
            report.type.toLowerCase().includes(lowerCaseSearchTerm) ||
            report.barangayName.toLowerCase().includes(lowerCaseSearchTerm);

        const matchesTypeFilter = typeFilter === '' || report.type === typeFilter;

        return matchesTypeFilter && matchesSearchTerm;
    });

    if (loading) {
        return <div className="loading-state-overlay">Loading map data...</div>;
    }

    if (error) {
        return <div className="error-state-overlay">{error}</div>;
    }

    return (
        <div className="map-container-wrapper">
            <Sidebar />
            <div className="map-area">
                <div className="container-map">
                    <div className="controls-bar">
                        <div className="search-bar-map">
                            <input
                                type="text"
                                placeholder="Search by ID, Type, or Barangay..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input-map"
                            />
                        </div>
                        <div className="filter-controls-map">
                            <label htmlFor="typeFilter">Filter by Type:</label>
                            <select
                                id="typeFilter"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="type-filter-select-map"
                            >
                                <option value="">All</option>
                                <option value="Animal Bite">Animal Bite</option>
                                <option value="Missing Animal">Missing Animal</option>
                                <option value="Animal Sighting">Animal Sighting</option>
                            </select>
                        </div>
                    </div>

                    <div className="map-section">
                        <MapContainer
                            center={[latParam || 14.5526, lngParam || 121.0356]}
                            zoom={13}
                            scrollWheelZoom={true}
                            className="full-size-map"
                        >
                            <MapInitializer />
                            <FlyToLocation lat={latParam} lng={lngParam} />
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />

                            {barangays.map((brgy) => {
                                // Filter reports for the current barangay
                                const reportsInThisBarangay = filteredReports.filter(r => r.barangayId === brgy._id);
                                if (reportsInThisBarangay.length === 0) return null; // Don't render anything if no reports match filters

                                const color = getBarangayColor(reportsInThisBarangay);

                                return (
                                    <React.Fragment key={brgy._id}>
                                        <Circle
                                            center={[brgy.latitude, brgy.longitude]}
                                            radius={brgy.radius}
                                            pathOptions={{
                                                color: color,
                                                fillColor: color,
                                                fillOpacity: 0.2
                                            }}
                                        />
                                        <Marker position={[brgy.latitude, brgy.longitude]}>
                                            <Popup>
                                                <div className="barangay-popup-content">
                                                    <h3>{brgy.name}</h3>
                                                    <p>District: {brgy.district}</p>
                                                    <h4>Reports:</h4>
                                                    {reportsInThisBarangay.length > 0 ? (
                                                        <ul className="popup-report-list">
                                                            {reportsInThisBarangay.map(report => (
                                                                <li key={report._id}>
                                                                    <strong>Type:</strong> {report.type}<br />
                                                                    <strong>Status:</strong> {report.status}<br />
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p>No reports found in this barangay with current filters.</p>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </React.Fragment>
                                );
                            })}
                        </MapContainer>
                    </div>

                    <div className="report-section">
                        <h2>Reports ({filteredReports.length})</h2>
                        <div className="table-container">
                            {filteredReports.length === 0 ? (
                                <div className="no-reports-message">No reports found matching your criteria.</div>
                            ) : (
                                <table>
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
                                        {filteredReports.map((report) => (
                                            <tr key={report._id}>
                                                <td>{report._id}</td>
                                                <td>{report.type}</td>
                                                <td>
                                                    {report.barangayName}<br />
                                                    <button
                                                        onClick={() => handleViewMap(report.barangayId)}
                                                        className="view-map-btn"
                                                    >
                                                        View on Map
                                                    </button>
                                                </td>
                                                <td>{new Date(report.date).toLocaleDateString()}</td>
                                                <td>{report.status}</td>
                                                <td>
                                                    {report.filePath ? (
                                                        <a
                                                            href={`${process.env.REACT_APP_API_URL}/${report.filePath}`}
                                                            download
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
                </div>
            </div>
        </div>
    );
};

export default MapPage;


