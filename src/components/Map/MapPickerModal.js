import React, { useCallback, useState, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 6.9271, // Default center (Colombo)
  lng: 79.8612,
};

const libraries = ['places']; // Load Places API

const MapPickerModal = ({ show, onClose, coords, setCoords }) => {
  const [marker, setMarker] = useState(coords || null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null); // For user feedback
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null); // To clear input on invalid selection

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries, // Include Places API
  });

  const handleMapClick = useCallback((event) => {
    const newCoords = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarker(newCoords);
    setError(null); // Clear error on valid map click
  }, []);

  const handleSave = () => {
    if (marker) {
      setCoords(marker);
      onClose();
    }
  };

  const onLoadMap = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onLoadAutocomplete = (autocomplete) => {
    autocompleteRef.current = autocomplete;
    // Restrict to cities in Sri Lanka
    autocomplete.setComponentRestrictions({ country: ['lk'] });
    autocomplete.setTypes(['(cities)']);
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      console.log('Selected place:', place); // Debugging
      // Check if place and geometry exist
      if (place && place.geometry && place.geometry.location) {
        const newCoords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMarker(newCoords);
        if (map) {
          map.panTo(newCoords); // Center map on selected location
          map.setZoom(12); // Adjusted zoom for city-level view
        }
        setError(null); // Clear any previous error
      } else {
        // Handle invalid place selection
        console.warn('Selected place has no valid geometry:', place);
        setError('Please select a valid city from the suggestions.');
        if (inputRef.current) {
          inputRef.current.value = ''; // Clear input
        }
      }
    }
  };

  if (!show) return null;
  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Pick Restaurant City</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <Autocomplete
              onLoad={onLoadAutocomplete}
              onPlaceChanged={onPlaceChanged}
            >
              <input
                type="text"
                placeholder="Search for a city in Sri Lanka"
                ref={inputRef} // Reference to clear input
                style={{
                  boxSizing: 'border-box',
                  border: '1px solid #ccc',
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  marginBottom: '10px',
                }}
              />
            </Autocomplete>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={marker || center}
              zoom={12} // Adjusted for city-level view
              onClick={handleMapClick}
              onLoad={onLoadMap}
            >
              {marker && <Marker position={marker} />}
            </GoogleMap>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-success"
              onClick={handleSave}
              disabled={!marker}
            >
              Save Location
            </button>
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;