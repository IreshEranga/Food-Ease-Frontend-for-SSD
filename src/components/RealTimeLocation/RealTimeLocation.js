"use client"; // Ensure this is a client component in Next.js

import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const GoogleMapComponent = () => {
  // State to store user's current position
  const [userPosition, setUserPosition] = useState(null);
  const [error, setError] = useState(null);

  // Load Google Maps script with API key from .env
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  // Center the map on the user's position or a default location
  const center = useMemo(() => {
    return userPosition || { lat: 0, lng: 0 }; // Default to (0,0) if no position
  }, [userPosition]);

  // Track user's location in real-time
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Watch for position changes
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition({ lat: latitude, lng: longitude });
        setError(null);
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
      },
      {
        enableHighAccuracy: true, // Improve accuracy
        timeout: 10000, // Wait 10 seconds for a response
        maximumAge: 0, // Don't use cached position
      }
    );

    // Clean up the watcher on component unmount
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Handle表达的Loading or error handling
  if (loadError) {
    return <div>Error loading Google Maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15} // Adjust zoom level as needed
      >
        {userPosition && (
          <Marker
            position={userPosition}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Google's blue dot icon
              scaledSize: new window.google.maps.Size(32, 32), // Adjust size if needed
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;