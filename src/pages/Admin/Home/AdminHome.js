import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import CountCard from '../../../components/CountCard/CountCard';
import api from '../../../api';
import { Container, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoadingGIF from '../../../assets/GIF/loading.gif';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { FaArrowCircleLeft, FaArrowCircleRight } from 'react-icons/fa';
import { FaPeopleGroup } from "react-icons/fa6";
import {BiStore, BiSolidUserCircle , BiCycling, BiShield } from 'react-icons/bi';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

function AdminHome() {
  const [customerCount, setCustomerCount] = useState(0);
  const [ownerCount, setOwnerCount] = useState(0);
  const [driverCount, setDriverCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [approvedRestaurantCount, setApprovedRestaurantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const fetchCustomerCount = async () => {
      try {
        const response = await api.get('/api/users/customers/count');
        if (response.data.success) {
          setCustomerCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching customer count:', error);
      }
    };

    const fetchOwnerCount = async () => {
      try {
        const response = await api.get('/api/users/owners/count');
        if (response.data.success) {
          setOwnerCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching owner count:', error);
      }
    };

    const fetchDriverCount = async () => {
      try {
        const response = await api.get('/api/users/drivers/count');
        if (response.data.success) {
          setDriverCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching driver count:', error);
      }
    };

    const fetchAdminCount = async () => {
      try {
        const response = await api.get('/api/users/admins/count');
        if (response.data.success) {
          setAdminCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching admin count:', error);
      }
    };

    const fetchWeeklyGrowth = async () => {
      try {
        const response = await api.get(`/api/users/customers/customerGrowth/${weekOffset}`);
        if (response.data.success) {
          setWeeklyData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching weekly customer growth:', error);
      }
    };

    const fetchApprovedRestaurantCount = async () => {
      try {
        const response = await api.get('/api/restaurant/restaurants/approved/count');
        if (response.data.success) {
          setApprovedRestaurantCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching restaurant count', error);
      }
    }

    Promise.all([fetchCustomerCount(), fetchOwnerCount(), fetchDriverCount(), fetchAdminCount(), fetchApprovedRestaurantCount(), fetchWeeklyGrowth()]).finally(() => {
      setLoading(false);
    });
  }, [weekOffset]);

const countData = [
    { title: 'Customers', count: customerCount, icon: <FaPeopleGroup size={40} /> },
    { title: 'Restaurants', count: approvedRestaurantCount, icon: <BiStore size={40} /> },
    { title: 'Owners', count: ownerCount, icon: <BiSolidUserCircle  size={40} /> },
    { title: 'Delivery Riders', count: driverCount, icon: <BiCycling size={40} /> },
    { title: 'Admins', count: adminCount, icon: <BiShield size={40} /> },
  ];

  const doughnutChartData = {
    labels: ['Customers', 'Owners', 'Admins'],
    datasets: [
      {
        data: [customerCount, ownerCount, adminCount],
        backgroundColor: ['#4CAF50', '#FF9800', '#FFD35B'],
        hoverBackgroundColor: ['#45A049', '#F57C00', '#FFD167'],
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
    },
  };

  const weeklyChartData = {
    labels: weeklyData.map(day => day._id),
    datasets: [
      {
        label: 'Customers Joined',
        data: weeklyData.map(day => day.count),
        backgroundColor: '#FE4F2D',
        borderColor: '#60B5FF',
        borderWidth: 2,
        fill: false,
        tension: 0.3, 
        pointBackgroundColor: '#FE4F2D',
        pointBorderColor: '#60B5FF',
        pointBorderWidth: 1,
        pointRadius: 4,
      },
    ],
  };

  const weeklyChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: (value) => Number.isInteger(value) ? value : null,
        },
      },
    },
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f5f5f5' }}>
        <Container fluid>
          {/* Count Cards */}
          <Row className="g-4 mb-4">
            {countData.map((data, index) => (
              <Col xs={12} sm={6} lg={3} key={index}>
                <CountCard
                  title={data.title}
                  count={loading ? 0 : data.count}
                  icon={data.icon}
                />
              </Col>
            ))}
          </Row>

          {/* Charts */}
          <Row className="g-4">
            <Col md={4}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="text-muted text-center mb-3">User Distribution</h5>
                  {loading ? (
                    <div className="text-center">
                      <img src={LoadingGIF} alt="Loading..." style={{ width: '40px', height: '40px' }} />
                    </div>
                  ) : (
                    <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                  )}
                </Card.Body>
              </Card>
            </Col>
            {/* <Col md={8}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="text-muted text-center mb-3">Daily Customer Growth</h5>
                  {loading ? (
                    <div className="text-center">
                      <img src={LoadingGIF} alt="Loading..." style={{ width: '40px', height: '40px' }} />
                    </div>
                  ) : (
                    <>
                      <Bar data={weeklyChartData} options={weeklyChartOptions} />
                      <div className="d-flex justify-content-center mt-3">
                        <button
                          onClick={() => setWeekOffset(prev => prev + 1)}
                          className="btn btn-secondary mx-2"
                          disabled={weekOffset >= 10}
                          style={{ backgroundColor: 'black' }}
                        >
                          <FaArrowCircleLeft />
                        </button>
                        <button
                          onClick={() => setWeekOffset(prev => Math.max(prev - 1, 0))}
                          className="btn btn-secondary mx-2"
                          style={{ backgroundColor: 'black' }}
                          disabled={weekOffset === 0}
                        >
                          <FaArrowCircleRight />
                        </button>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col> */}

<Col md={8}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h5 className="text-muted text-center mb-3">Daily Customer Growth</h5>
                  {loading ? (
                    <div className="text-center">
                      <img src={LoadingGIF} alt="Loading..." style={{ width: '40px', height: '40px' }} />
                    </div>
                  ) : (
                    <>
                      <Line data={weeklyChartData} options={weeklyChartOptions} />
                      <div className="d-flex justify-content-center mt-3">
                        <button
                          onClick={() => setWeekOffset(prev => prev + 1)}
                          className="btn btn-secondary mx-2"
                          disabled={weekOffset >= 10}
                          style={{ backgroundColor: 'black' }}
                        >
                          <FaArrowCircleLeft />
                        </button>
                        <button
                          onClick={() => setWeekOffset(prev => Math.max(prev - 1, 0))}
                          className="btn btn-secondary mx-2"
                          style={{ backgroundColor: 'black' }}
                          disabled={weekOffset === 0}
                        >
                          <FaArrowCircleRight />
                        </button>

                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default AdminHome;