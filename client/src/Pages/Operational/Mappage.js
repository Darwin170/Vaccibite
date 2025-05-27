import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './BarangayMap.css';
import Sidebar from './Sidebar';

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

const BarangayMap = () => {
  const query = useQuery();
  const latParam = parseFloat(query.get('lat'));
  const lngParam = parseFloat(query.get('lng'));

  const [barangays, setBarangays] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_API_URL}/auth/Barangays`).then(res => res.json()),
      fetch(`${process.env.REACT_APP_API_URL}/auth/reports`).then(res => res.json())
    ])
      .then(([barangayData, reportData]) => {
        const reportedBarangayIds = new Set(reportData.map(report => report.barangayId));
        const filteredBarangays = barangayData
          .filter(b => reportedBarangayIds.has(b._id))
          .map(item => ({
            _id: item._id,
            name: item.name,
            coords: [item.latitude, item.longitude],
            radius: item.radius
          }));
        setBarangays(filteredBarangays);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="map-container-wrapper">
      <Sidebar />
      <div className="map-area">
        <MapContainer
          center={[14.6760, 121.0437]}
          zoom={14}
          className="leaflet-container"
        >
          <FlyToLocation lat={latParam} lng={lngParam} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {barangays.map((brgy, index) => (
            <React.Fragment key={brgy._id || index}>
              <Marker position={brgy.coords}>
                <Popup>{brgy.name}</Popup>
              </Marker>
              <Circle
                center={brgy.coords}
                radius={brgy.radius}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
              />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default BarangayMap;
