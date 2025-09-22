// components/TripMap.js

import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const TripMap = ({ originCoords, pickupAddress, dropAddress }) => {
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    if (!originCoords || !pickupAddress || !dropAddress) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: originCoords,
        destination: dropAddress,
        waypoints: [{ location: pickupAddress }],
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Failed to fetch directions:', result);
        }
      }
    );
  }, [originCoords, pickupAddress, dropAddress]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={originCoords} zoom={12}>
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default TripMap;
