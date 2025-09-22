import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LocationMarker = ({ onSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const place = res.data.display_name;
        onSelect({ lat, lng, name: place });
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    }
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
};

const MapModal = ({ onClose, onSelect }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex',
      justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ width: '90%', height: '80%', position: 'relative', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>X</button>
        <MapContainer center={[6.9271, 79.8612]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onSelect={onSelect} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapModal;
