import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import { Container, Row, Col, Card } from 'react-bootstrap';
import CountCard from '../../../components/CountCard/CountCard';
import api from '../../../api';
import { IoFastFoodSharp, IoTrendingUpOutline, IoTrendingDownOutline } from 'react-icons/io5';
import { MdTableRows } from "react-icons/md";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AdminAnalytics() {
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [totalOrderCountYesterday, setTotalOrderCountYesterday] = useState(0);
  const [dailyOrders, setDailyOrders] = useState([]);
  const [categoryCount, setCategoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalOrderCount = async () => {
      try {
        const response = await api.get('/api/order/orders/totalOrders');
        if (response.status === 200) {
          setTotalOrderCount(response.data.totalOrders);
        }
      } catch (error) {
        console.error('Error fetching total order count:', error);
      }
    };

    const fetchTotalOrderCountYesterday = async () => {
      try {
        const response = await api.get('/api/order/orders/yesterday-orders');
        if (response.status === 200) {
          setTotalOrderCountYesterday(response.data.yesterdayOrders);
        }
      } catch (error) {
        console.error('Error fetching yesterday order count:', error);
      }
    };

    const fetchDailyOrders = async () => {
      try {
        const response = await api.get('/api/order/orders/daily-orders');
        if (response.status === 200) {
          setDailyOrders(response.data);
        }
      } catch (error) {
        console.error('Error fetching daily orders:', error);
      }
    };

    const fetchCategoryCount = async () => {
      try {
        const response = await api.get('/api/restaurant/categories/categoryCount');
        if (response.data.success) {
          setCategoryCount(response.data.categoryCount);
        }
      } catch (error) {
        console.error('Error fetching total order count:', error);
      }
    }

    Promise.all([
      fetchTotalOrderCount(),
      fetchTotalOrderCountYesterday(),
      fetchDailyOrders(),
      fetchCategoryCount()
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const percentageChange = calculatePercentageChange(totalOrderCount, totalOrderCountYesterday);
  const isIncrease = percentageChange >= 0;

  const countData = [
    {
      title: 'Total Orders',
      count: loading ? 0 : totalOrderCount,
      icon: <IoFastFoodSharp size={40} />,
      showChange: true,
      change: Math.abs(percentageChange.toFixed(1)),
      changeIcon: isIncrease ? <IoTrendingUpOutline color="green" size={20} /> : <IoTrendingDownOutline color="red" size={20} />,
      changeColor: isIncrease ? 'green' : 'red'
    },
    {
      title: 'Total Orders Yesterday',
      count: loading ? 0 : totalOrderCountYesterday,
      icon: <IoFastFoodSharp size={40} />,
      showChange: false
    },
    {
      title: 'Total Categories',
      count: loading ? 0 : categoryCount,
      icon: <MdTableRows size={40} />,
      showChange: false
    },
  ];

  const lineChartData = {
    labels: dailyOrders.map(order => order._id),
    datasets: [
      {
        label: 'Daily Orders',
        data: dailyOrders.map(order => order.count),
        fill: false,
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        tension: 0.3
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Orders Over Time'
      }
    }
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
                  count={data.count}
                  icon={data.icon}
                  showChange={data.showChange}
                  change={data.change}
                  changeIcon={data.changeIcon}
                  changeColor={data.changeColor}
                />
              </Col>
            ))}
          </Row>

          {/* Line Chart */}
          <Row className="mt-4">
            <Col xs={12} md={6}>
              <Card className="p-3">
                <Line data={lineChartData} options={lineChartOptions} />
              </Card>
            </Col>
          </Row>

        </Container>
      </div>
    </div>
  );
}

export default AdminAnalytics;
