import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import RiderSidebar from '../../components/RiderSidebar/RiderSidebar';
import { Dialog } from '@headlessui/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DriverDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [location, setLocation] = useState(null);

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
  
    const token = localStorage.getItem('token'); // ✅ Get token once
  
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
              Authorization: `Bearer ${token}`, // ✅ Include token in headers
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
            setLocation({ lat: latitude, lng: longitude }); // For map usage
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
  
    fetchAndSendLocation(); // 🔁 Initial fetch
    const interval = setInterval(fetchAndSendLocation, 30000); // 🔁 every 30 sec
  
    return () => clearInterval(interval); // 🔁 cleanup
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

  const openDialog = (delivery) => {
    setSelectedDelivery(delivery);
    setStatus(delivery.status);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedDelivery(null);
    setIsDialogOpen(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedDelivery) return;

    try {
      setLoading(true);
      await axios.put(`${process.env.REACT_APP_BACKEND_API}/api/delivery/${selectedDelivery._id}`, {
        status: status,
      });
      setMessage('Status updated successfully');

      setDeliveries((prev) =>
        prev.map((item) => (item._id === selectedDelivery._id ? { ...item, status: status } : item))
      );

      closeDialog();
    } catch (error) {
      console.error('Error updating delivery:', error.response?.data || error.message);
      setMessage('Error updating delivery');
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
    <div div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      backgroundColor: '#fff',
      minHeight: '900vh',
      padding: '20px',
    }}>
      <div ><RiderSidebar /></div>
      <div style={{
        flex: 1,
        marginLeft: '20px',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        width: '60%',}}>
        <center>
          <h2 className="text-2xl font-bold mb-6">Driver Dashboard</h2>

          {deliveries.length === 0 ? (
            <p>No deliveries assigned.</p>
          ) : (
            <ul className="space-y-4">
              {deliveries.map((delivery) => (
                <li key={delivery._id} className="border p-4 rounded shadow">
                  <div><strong>Pickup:</strong> {delivery.pickupAddress}</div>
                  <div><strong>Drop:</strong> {delivery.dropAddress}</div>
                  <div><strong>Status:</strong> {delivery.status}</div>
                 
                </li>
              ))}
            </ul>
          )}

          {message && <p className="mt-4 text-green-600">{message}</p>}

          {/* Show Live Map */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-2">Your Real-Time Location</h3>
            {location ? (
              <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '300px', width: '500px' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={[location.lat, location.lng]} icon={customIcon}>
                  <Popup>Your current location</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <p>Fetching location...</p>
            )}
          </div>
        </center>

        {/* Dialog Box */}
        <Dialog open={isDialogOpen} onClose={closeDialog} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 ml-5 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-bold mb-4">Update Delivery Status</Dialog.Title>
              <div className="space-y-2">
                {['assigned', 'picked', 'delivered', 'cancelled'].map((value) => (
                  <label key={value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={value}
                      checked={status === value}
                      onChange={(e) => setStatus(e.target.value)}
                    />
                    <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={handleUpdateStatus}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Update
                </button>
                <button
                  onClick={closeDialog}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default DriverDeliveries;
