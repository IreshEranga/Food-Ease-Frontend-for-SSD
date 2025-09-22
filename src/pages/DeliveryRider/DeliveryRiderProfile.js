import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DeliveryDriver = () => {
    const [rider, setRider] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAvailable, setIsAvailable] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('jwtToken'); // Assuming token is stored in localStorage
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/api/users/deliveryrider/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setRider(response.data);
                setIsAvailable(response.data.isAvailable);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch profile. Please try again.');
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleAvailabilityToggle = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.patch(
                `${process.env.REACT_APP_BACKEND_API}/api/users/deliveryrider/profile`,
                { isAvailable: !isAvailable },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setIsAvailable(response.data.isAvailable);
            setRider({ ...rider, isAvailable: response.data.isAvailable });
        } catch (err) {
            setError('Failed to update availability status.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-8 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Rider Profile</h1>
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-600">Rider ID:</span>
                    <span>{rider.riderID}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-600">Name:</span>
                    <span>{rider.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-600">Email:</span>
                    <span>{rider.email}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-600">Mobile:</span>
                    <span>{rider.mobileNumber}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-600">Vehicle Number:</span>
                    <span>{rider.vehicleNumber}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                        rider.status === 'active' ? 'bg-green-100 text-green-800' :
                        rider.status === 'on-delivery' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {rider.status}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-600">Current Location:</span>
                    <span>
                        {rider.currentLocation.coordinates[0].toFixed(4)}, 
                        {rider.currentLocation.coordinates[1].toFixed(4)}
                    </span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-600">Availability:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isAvailable}
                            onChange={handleAvailabilityToggle}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                            {isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                    </label>
                </div>
            </div>
            <div className="mt-6">
                <button
                    onClick={() => alert('Edit profile functionality to be implemented')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Edit Profile
                </button>
            </div>
        </div>
    );
};

export default DeliveryDriver;