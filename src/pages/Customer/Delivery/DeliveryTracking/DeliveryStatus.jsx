import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../../api';
import './DeliveryStatus.css';

const DeliveryStatus = () => {
  const { orderId } = useParams(); // Get orderId from URL
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch delivery statuses for the order
  useEffect(() => {
    const fetchDeliveryStatuses = async () => {
      try {
        console.log('Fetching delivery statuses for orderId:', orderId);
        const response = await api.getDeliveryStatus(orderId);
        console.log('Delivery statuses:', response.data);
        setStatuses(response.data.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))); // Sort ascending
        setError(null);
      } catch (error) {
        console.error('Error fetching delivery statuses:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setError(error.response?.data?.message || 'Failed to load delivery status.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryStatuses();
  }, [orderId]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading delivery status...
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="delivery-status-container">
      <h2 className="delivery-status-title">Delivery Status for Order #{orderId.slice(-6)}</h2>
      {statuses.length === 0 ? (
        <div className="empty-state">No delivery status updates available.</div>
      ) : (
        <div className="status-timeline">
          {statuses.map((status, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="status-label">{status.status}</span>
                <span className="status-time">
                  {new Date(status.updatedAt).toLocaleString()}
                </span>
                {status.details && <span className="status-details">{status.details}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryStatus;