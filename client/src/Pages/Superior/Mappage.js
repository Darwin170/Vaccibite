import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import Sidebar from './Sidebar';

import './BarangayMap.css';
import './Sidebar.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const useQuery = () => new URLSearchParams(useLocation().search);

const FlyToLocation = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 16);
    }
  }, [lat, lng, map]);
  return null;
};

const MapPage = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const latParam = parseFloat(query.get('lat'));
  const lngParam = parseFloat(query.get('lng'));

  const [barangays, setBarangays] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [barangayRes, reportsRes] = await Promise.all([
          axios.get(`${API_URL}/auth/Barangays`),
          axios.get(`${API_URL}/auth/reports`),
        ]);
        setBarangays(barangayRes.data);
        setReports(reportsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const getBarangayName = (barangayId) => {
    const barangay = barangays.find(b => b._id === barangayId);
    return barangay ? barangay.name : 'Unknown';
  };

  const handleViewMap = (barangayId) => {
    const barangay = barangays.find(b => b._id === barangayId);
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
    <div className="map-container-wrapper">
      <Sidebar />

      <div className="map-area" style={{ marginLeft: '200px' }}>
        <div className="container">

          {/* === Map Section === */}
          <div className="map-section">
            <MapContainer center={[14.5526, 121.0356]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <FlyToLocation lat={latParam} lng={lngParam} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {barangays.map((brgy) => (
                <React.Fragment key={brgy._id}>
                  <Marker position={[brgy.latitude, brgy.longitude]}>
                    <Popup>{brgy.name}</Popup>
                  </Marker>
                  <Circle
                    center={[brgy.latitude, brgy.longitude]}
                    radius={brgy.radius}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                  />
                </React.Fragment>
              ))}

              {filteredReports.map((report) => {
                const coords = report.coordinates;
                const position = Array.isArray(coords)
                  ? coords
                  : coords?.lat && coords?.lng
                  ? [coords.lat, coords.lng]
                  : null;

                return position ? (
                  <Marker key={report._id} position={position}>
                    <Popup>
                      {getBarangayName(report.barangayId)} <br />
                      {report.type}
                    </Popup>
                  </Marker>
                ) : null;
              })}
            </MapContainer>
          </div>

          {/* === Reports Table === */}
          <div className="report-section">
            <h2>Reports</h2>

            {/* Optional: Filters UI */}
            <div className="filters">
              <label>
                Type:
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="bite">Bite</option>
                  <option value="roaming">Roaming</option>
                  <option value="missing">Missing</option>
                </select>
              </label>

              <label>
                Status:
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
              </label>
            </div>

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
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report._id}>
                      <td>{report._id}</td>
                      <td>{report.type}</td>
                      <td>
                        {getBarangayName(report.barangayId)}<br />
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
                            href={`${API_URL}/${report.filePath}`}
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No reports found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MapPage;
