import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RestaurantOwnerHome.css';
import LoadingGIF from '../../../assets/GIF/loading.gif';
import { motion } from 'framer-motion';
import { getGreeting } from '../../../utils/getGreeting';
import api from '../../../api';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { jwtDecode } from 'jwt-decode';
import RestaurantOwnerSidebar from '../../../components/RestaurantOwnerSidebar/RestaurantOwnerSidebar';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const RestaurantOwnerHome = () => {
  const [counts, setCounts] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [ordersCount, setOrdersCount] = useState({
    Pending: 0,
    Confirmed: 0,
    Prepared: 0,
    'On Delivery': 0,
    Completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordersError, setOrdersError] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [ownerName, setOwnerName] = useState('');
  const [approvedRestaurants, setApprovedRestaurants] = useState([]);

  // Fetch ownerId from JWT token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.roleID !== 'role2') {
          setError('Unauthorized access: Not a Restaurant Owner');
          setLoading(false);
        } else {
          setOwnerId(decodedToken.userID);
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Failed to retrieve owner information. Please log in again.');
        setLoading(false);
      }
    } else {
      setError('No authentication token found. Please log in.');
      setLoading(false);
    }
  }, []);

  // Fetch data when ownerId is available
  useEffect(() => {
    if (!ownerId || error) return;

    const fetchOwnerDetails = async () => {
      try {
        const response = await api.get(`/api/users/owners/${ownerId}/name`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.data.success) {
          setOwnerName(response.data.name || 'Owner');
        }
      } catch (error) {
        console.error('Error fetching owner name:', error);
        setOwnerName('Owner'); // Fallback
      }
    };

    const fetchRestaurantCounts = async () => {
      try {
        const response = await api.get(`/api/restaurant/restaurants/owner/${ownerId}/counts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.data.success) {
          setCounts({
            approved: response.data.data.approved || 0,
            pending: response.data.data.pending || 0,
            rejected: response.data.data.rejected || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching restaurant counts:', error);
      }
    };

    const fetchApprovedRestaurants = async () => {
      try {
        const response = await api.get(`/api/restaurant/restaurants/owner/${ownerId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const approved = response.data.filter(r => r.approvalStatus === 'approved');
        setApprovedRestaurants(approved);
      } catch (error) {
        console.error('Error fetching approved restaurants:', error);
      }
    };

    const fetchOrdersCount = async () => {
      if (approvedRestaurants.length === 0 || ordersError) return;
      try {
        const restaurantIds = approvedRestaurants.map(r => r._id);
        const response = await api.get(`/api/order/orders/owner/${ownerId}/status-counts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: { restaurantId: restaurantIds }
        });
        if (response.data.success) {
          setOrdersCount(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching order counts by status:', error);
        setOrdersError('Failed to fetch order counts. Please try again later.');
      }
    };

    Promise.all([
      fetchOwnerDetails(),
      fetchRestaurantCounts(),
      fetchApprovedRestaurants()
    ]).then(() => {
      fetchOrdersCount();
    }).finally(() => {
      setLoading(false);
    });
  }, [ownerId, error, approvedRestaurants, ordersError]);

  // Doughnut chart data and options for restaurant counts
  const restaurantChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [counts.approved, counts.pending, counts.rejected],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
        hoverBackgroundColor: ['#45A049', '#F57C00', '#D32F2F'],
        borderWidth: 1,
      },
    ],
  };

  // Doughnut chart data and options for order counts
  const orderChartData = {
    labels: ['Pending', 'Confirmed', 'Prepared', 'On Delivery', 'Completed'],
    datasets: [
      {
        data: [
          ordersCount.Pending,
          ordersCount.Confirmed,
          ordersCount.Prepared,
          ordersCount['On Delivery'],
          ordersCount.Completed
        ],
        backgroundColor: ['#FF9800', '#4CAF50', '#2196F3', '#FFC107', '#8BC34A'],
        hoverBackgroundColor: ['#F57C00', '#45A049', '#1976D2', '#FFB300', '#7CB342'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  if (error) {
    return (
      <div className="home-page-wrapper">
        <RestaurantOwnerSidebar />
        <div className="home-content-area">
          <h3 className="home-error-text">{error}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page-wrapper">
      <RestaurantOwnerSidebar />
      <div className="home-content-area">
        <Container fluid className="restaurantOwnerHome-container">
          {ownerId ? (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="home-title"
                style={{ color: '#c82333', fontWeight: 600 }}
              >
                {getGreeting()}, {ownerName}!
              </motion.h2>
            </>
          ) : (
            <p className="home-loading-text">Loading owner information...</p>
          )}
          {ordersError && (
            <div className="restaurantOwnerHome-error">
              {ordersError}
            </div>
          )}
          <Row className="restaurantOwnerHome-stats">
            <Col xs={6} md={3} className="mb-3">
              <Card className="restaurantOwnerHome-card">
                <Card.Body>
                  <center>
                    <Card.Title className="restaurantOwnerHome-cardTitle">Approved Restaurants</Card.Title>
                    <h3 className="restaurantOwnerHome-cardValue">
                      {loading ? (
                        <img
                          src={LoadingGIF}
                          alt="Loading..."
                          className="home-loading-gif"
                        />
                      ) : (
                        counts.approved
                      )}
                    </h3>
                  </center>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3} className="mb-3">
              <Card className="restaurantOwnerHome-card">
                <Card.Body>
                  <center>
                    <Card.Title className="restaurantOwnerHome-cardTitle">Pending Restaurants</Card.Title>
                    <h3 className="restaurantOwnerHome-cardValue">
                      {loading ? (
                        <img
                          src={LoadingGIF}
                          alt="Loading..."
                          className="home-loading-gif"
                        />
                      ) : (
                        counts.pending
                      )}
                    </h3>
                  </center>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3} className="mb-3">
              <Card className="restaurantOwnerHome-card">
                <Card.Body>
                  <center>
                    <Card.Title className="restaurantOwnerHome-cardTitle">Rejected Restaurants</Card.Title>
                    <h3 className="restaurantOwnerHome-cardValue">
                      {loading ? (
                        <img
                          src={LoadingGIF}
                          alt="Loading..."
                          className="home-loading-gif"
                        />
                      ) : (
                        counts.rejected
                      )}
                    </h3>
                  </center>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6} md={3} className="mb-3">
              <Card className="restaurantOwnerHome-card">
                <Card.Body>
                  <center>
                    <Card.Title className="restaurantOwnerHome-cardTitle">Total Orders</Card.Title>
                    <h3 className="restaurantOwnerHome-cardValue">
                      {loading || ordersError ? (
                        <img
                          src={LoadingGIF}
                          alt="Loading..."
                          className="home-loading-gif"
                        />
                      ) : (
                        Object.values(ordersCount).reduce((sum, count) => sum + count, 0)
                      )}
                    </h3>
                  </center>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6} className="mb-3">
              <Card className="restaurantOwnerHome-card-chart">
                <Card.Body>
                  <h5 className="restaurantOwnerHome-cardTitle text-center">Restaurant Status Distribution</h5>
                  <div className="home-chart-container">
                    {loading ? (
                      <center>
                        <img
                          src={LoadingGIF}
                          alt="Loading..."
                          className="home-loading-gif"
                        />
                      </center>
                    ) : (
                      <Doughnut data={restaurantChartData} options={chartOptions} />
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6} className="mb-3">
              <Card className="restaurantOwnerHome-card-chart">
                <Card.Body>
                  <h5 className="restaurantOwnerHome-cardTitle text-center">Order Status Distribution</h5>
                  <div className="home-chart-container">
                    {loading || ordersError ? (
                      <center>
                        <img
                          src={LoadingGIF}
                          alt="Loading..."
                          className="home-loading-gif"
                        />
                      </center>
                    ) : (
                      <Doughnut data={orderChartData} options={chartOptions} />
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default RestaurantOwnerHome;