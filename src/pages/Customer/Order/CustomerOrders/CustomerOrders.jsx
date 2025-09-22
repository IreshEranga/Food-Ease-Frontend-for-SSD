import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../../store/useAuthStore';
import api from '../../../../api';
import CustomerSideBar from '../../../../components/CustomerSideBar/CustomerSideBar';
import './CustomerOrders.css';
import { useMediaQuery } from 'react-responsive';
import CustomerBottomNavbar from '../../../../components/CustomerBottomNavbar/CustomerBottomNavbar';

const CustomerOrders = () => {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = useAuthStore((state) => state.token);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile with token:', token);
        if (!token) throw new Error('No authentication token found');
        const response = await api.get('/api/users/customers/profile');
        console.log('User data:', response.data);
        setCustomer(response.data.data);
      } catch (error) {
        console.error('Error fetching customer profile:', error);
        setError(error.response?.data?.message || 'Failed to load user profile.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!customer?._id || !token) {
        console.log('Skipping fetchOrders: Missing customer._id or token', { customer, token });
        setLoading(false);
        setError('Please log in to view your orders.');
        return;
      }

      try {
        console.log('Fetching orders for userId:', customer._id);
        const response = await api.get(`/api/order/orders/user/${customer._id}`, {
          params: { sortBy: 'createdAt', order: 'desc' },
        });
        console.log('Orders data:', response.data);
        setOrders(response.data.orders || []);
        setTotalOrders(response.data.totalOrders || 0);
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setError(error.response?.data?.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customer?._id, token]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading orders...
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-orders-container">
      {isDesktop && <CustomerSideBar />}
      <h2 className="user-orders-title">Your Orders ({totalOrders})</h2>
      {orders.length === 0 ? (
        <div className="empty-state">You haven't placed any orders yet.</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order #{order._id.slice(-6)}</span>
                <span className="order-status">{order.orderStatus}</span>
              </div>
              <div className="order-details">
                <div className="detail-item">
                  <span className="detail-label">Restaurant:</span>
                  <span className="detail-value">
                    {order.restaurantName} ({order.branchName})
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value">Rs. {order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment:</span>
                  <span className="detail-value">{order.paymentStatus || 'Pending'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Delivery Address:</span>
                  <span className="detail-value">{order.deliveryAddress}</span>
                </div>
              </div>
              <div className="order-items">
                <h3 className="items-title">Items</h3>
                <ul className="items-list">
                  {order.items.map((item, index) => (
                    <li key={index} className="item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-actions">
                <Link to={`/customer/order-tracking/${order._id}`} className="action-button primary">
                  Track Order
                </Link>
              </div>
            </div>
          ))}
          <br/><br/>
        </div>
      )}
      {!isDesktop && <CustomerBottomNavbar />}
    </div>
  );
};

export default CustomerOrders;