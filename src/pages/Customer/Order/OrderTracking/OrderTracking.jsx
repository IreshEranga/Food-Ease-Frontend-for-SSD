import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../../api';
import { FaUtensils } from 'react-icons/fa';
import './OrderTracking.css';
import { useMediaQuery } from 'react-responsive';
import CustomerSideBar from '../../../../components/CustomerSideBar/CustomerSideBar';
import CustomerBottomNavbar from '../../../../components/CustomerBottomNavbar/CustomerBottomNavbar';

const OrderTracking = () => {
    const isDesktop = useMediaQuery({ minWidth: 768 });
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order status with polling
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log('Fetching order for orderId:', orderId);
        const response = await api.get(`/api/order/orders/${orderId}`);
        console.log('Order data:', response.data);
        const newOrder = response.data;
        setOrder(newOrder);

        // Add to status history
        const newStatusEntry = {
          status: newOrder.orderStatus,
          updatedAt: newOrder.updatedAt,
          details: `Order ${newOrder.orderStatus.toLowerCase()} by ${newOrder.restaurantName}`,
        };
        setStatusHistory((prev) => {
          const exists = prev.some(
            (entry) => entry.status === newStatusEntry.status && entry.updatedAt === newStatusEntry.updatedAt
          );
          if (!exists) {
            return [...prev, newStatusEntry].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
          }
          return prev;
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching order:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setError(error.response?.data?.error || 'Failed to load order status.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading order status...
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!order) {
    return <div className="error">Order not found.</div>;
  }

  const currentStatus = order.orderStatus;

  return (
    <div className="order-tracking-container">
    {isDesktop && <CustomerSideBar />}
      <h2 className="order-tracking-title">Tracking Order #{orderId.slice(-6)}</h2>
      <div className="status-indicator">
        <FaUtensils className={`tracking-icon ${currentStatus === 'Prepared' ? 'pulsing' : ''}`} />
        <span className="current-status">{currentStatus}</span>
      </div>
      {statusHistory.length === 0 ? (
        <div className="empty-state">No status updates available.</div>
      ) : (
        <div className="status-timeline">
          {statusHistory.map((status, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="status-label">{status.status}</span>
                <span className="status-time">{new Date(status.updatedAt).toLocaleString()}</span>
                {status.details && <span className="status-details">{status.details}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {!isDesktop && <CustomerBottomNavbar />}
    </div>
  );
};

export default OrderTracking;