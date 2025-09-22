import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaUserCircle, FaPhoneAlt, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import EditProfileModal from './EditProfileModal';
import CustomerBottomNavbar from '../../../components/CustomerBottomNavbar/CustomerBottomNavbar';
import CustomerSideBar from '../../../components/CustomerSideBar/CustomerSideBar';
import MapModal from '../../../components/Map/MapModal';
import { useAuthStore } from '../../../store/useAuthStore';
import api from '../../../api';
import { useNavigate } from 'react-router-dom';
import './CustomerProfile.css';

function CustomerProfile() {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const token = useAuthStore((state) => state.token);
  const deliveryLocation = useAuthStore((state) => state.deliveryLocation);
  const setDeliveryLocation = useAuthStore((state) => state.setDeliveryLocation);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/users/customers/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomerData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleLocationSelect = ({ lat, lng, name }) => {
    setDeliveryLocation(name, { lat, lng });
    setShowMap(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login', { replace: true });
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  return (
    <div className="customer-profile-container">
      {isDesktop && <CustomerSideBar />}

      <div className="profile-content">
        {/* Top-right Location Button - Desktop Only */}
        {isDesktop && (
          <div
            className="location-button"
            onClick={() => setShowMap(true)}
            title="Set Delivery Location"
          >
            {deliveryLocation && (
              <span className="location-text">{deliveryLocation}</span>
            )}
            <FaMapMarkerAlt size={22} color="#e74c3c" />
          </div>
        )}

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="profile-card"
        >
          <FaUserCircle size={90} color="#e67e22" className="profile-icon" />
          <h2 className="profile-name">
            {customerData?.name || 'Loading...'}
          </h2>
          <p className="profile-info">
            <FaEnvelope size={14} className="info-icon" />
            {customerData?.email}
          </p>
          <p className="profile-info">
            <FaPhoneAlt size={14} className="info-icon" />
            {customerData?.mobileNumber || 'No phone'}
          </p>
          <p className="profile-info">
            <FaMapMarkerAlt size={14} className="info-icon" />
            {customerData?.address || 'No address'}
          </p>

          <div className="profile-actions">
            <h4 className="delivery-title">Delivery Location:</h4>
            <p className="delivery-location">
              {deliveryLocation || 'No location set'}
            </p>
            <button
              onClick={() => setShowMap(true)}
              className="action-button-profile change-location"
            >
              Change Location
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="action-button-profile edit-profile"
            >
              Edit Profile
            </button>
            {!isDesktop && (
              <button
                onClick={handleLogout}
                className="action-button-profile logout-button"
              >
                <FaSignOutAlt size={14} className="logout-icon" />
                Logout
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {!isDesktop && <CustomerBottomNavbar />}

      {/* Map Modal */}
      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          onSelect={handleLocationSelect}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          customerData={customerData}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedData) => setCustomerData(updatedData)}
        />
      )}
    </div>
  );
}

export default CustomerProfile;