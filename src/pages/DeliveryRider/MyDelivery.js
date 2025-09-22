import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import RiderSidebar from '../../components/RiderSidebar/RiderSidebar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MyDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useState(null);

  const getDriverIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found in localStorage');
        return null;
      }
      const decoded = jwtDecode(token);
      return decoded.userID;
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  };

  // Update location and fetch real-time geolocation
  useEffect(() => {
    const driverId = getDriverIdFromToken();
    if (!driverId) return;

    const token = localStorage.getItem('token');

    const updateLocation = async (latitude, longitude) => {
      try {
        await axios.put(
          `${process.env.REACT_APP_BACKEND_API}/api/users/deliveryrider/rupdate/${driverId}`,
          {
            currentLocation: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Location updated:', latitude, longitude);
      } catch (error) {
        console.error('Error updating location:', error.response?.data || error.message);
      }
    };

    const fetchAndSendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
            updateLocation(latitude, longitude);
          },
          (error) => {
            console.error('Geolocation error:', error.message);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    fetchAndSendLocation();
    const interval = setInterval(fetchAndSendLocation, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDeliveries = async () => {
      const driverId = getDriverIdFromToken();
      if (!driverId) {
        console.error('Driver ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/api/delivery/driver/${driverId}`);
        setDeliveries(response.data);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (deliveryId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`${process.env.REACT_APP_BACKEND_API}/api/delivery/${deliveryId}`, {
        status: newStatus,
      });
      setDeliveries((prev) =>
        prev.map((item) =>
          item._id === deliveryId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Error updating delivery:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      backgroundColor: '#fff',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <div><RiderSidebar /></div>
      <div style={{
        flex: 1,
        marginLeft: '20px',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        width: '60%',
      }}>
      <center>
  <h2 className="text-2xl font-bold mb-6">Assigned Deliveries</h2>

  {deliveries.length === 0 ? (
    <p>No deliveries assigned.</p>
  ) : (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ color: 'white', backgroundColor: 'orange', padding: '10px', border: '1px solid #ddd' }}>Pickup</th>
          <th style={{ color: 'white', backgroundColor: 'orange', padding: '10px', border: '1px solid #ddd' }}>Drop</th>
          <th style={{ color: 'white', backgroundColor: 'orange', padding: '10px', border: '1px solid #ddd' }}>Status</th>
          <th style={{ color: 'white', backgroundColor: 'orange', padding: '10px', border: '1px solid #ddd' }}>Update Status</th>
        </tr>
      </thead>
      <tbody>
        {deliveries.map((delivery) => (
          <tr key={delivery._id} style={{ textAlign: 'center' }}>
            <td style={{ padding: '10px', border: '1px solid #ddd' ,width:'50px'}}>{delivery.pickupAddress}</td>
            <td style={{ padding: '10px', border: '1px solid #ddd'  ,width:'50px'}}>{delivery.dropAddress}</td>
            <td style={{ padding: '10px', border: '1px solid #ddd'  ,width:'50px'}}>{delivery.status}</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' ,width:'50px' }}>
              <select
                value={delivery.status}
                onChange={(e) => handleUpdateStatus(delivery._id, e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                }}
              >
                <option value="assigned">Assigned</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}

         
        </center>
      </div>
    </div>
  );
};

export default MyDeliveries;
