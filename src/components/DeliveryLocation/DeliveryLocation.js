import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';
import MapModal from '../Map/MapModal';

const DeliveryLocationButton = ({ isDesktop }) => {
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Read delivery location from local storage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('auth-storage'));
    if (stored?.state?.deliveryLocation) {
      setDeliveryLocation(stored.state.deliveryLocation);
    }
  }, []);

  // Handle the location selection from the map
  const handleSelectLocation = (locationData) => {
    const { name } = locationData;

    // Update localStorage with the selected delivery location
    const stored = JSON.parse(localStorage.getItem('auth-storage')) || {};
    const updated = {
      ...stored,
      state: {
        ...stored.state,
        deliveryLocation: name,
      },
    };
    localStorage.setItem('auth-storage', JSON.stringify(updated));

    // Update state and close map modal
    setDeliveryLocation(name);
    setShowMap(false);
  };

  // if (!isDesktop) return null;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
        onClick={() => setShowMap(true)}
        title="Set Delivery Location"
      >
        {deliveryLocation && (
          <span
            style={{
              fontSize: '14px',
              color: '#333',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              maxWidth: '250px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {deliveryLocation}
          </span>
        )}
        <FaMapMarkerAlt size={22} color="#e74c3c" />
      </div>

      {/* Map Modal */}
      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          onSelect={handleSelectLocation}
        />
      )}
    </>
  );
};

DeliveryLocationButton.propTypes = {
  isDesktop: PropTypes.bool.isRequired,
};

export default DeliveryLocationButton;
