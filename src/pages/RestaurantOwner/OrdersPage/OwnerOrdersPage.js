import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../../api';
import RestaurantOwnerSidebar from '../../../components/RestaurantOwnerSidebar/RestaurantOwnerSidebar';
import Toast from '../../../utils/toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Form, Row, Col, InputGroup, Pagination, Button, Tab, Tabs } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { successMessage } from '../../../utils/Alert';
import TastiGoLogo from '../../../assets/Images/T.png';
import './OwnerOrdersPage.css';

// Helper function to format column names
const formatColumnName = (col) => {
  return col
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim(); // Remove leading/trailing spaces
};

const generatePDF = (columns, data, fileName, title = 'Report', orientation = 'portrait') => {
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4',
    lineHeight: 1.2,
  });

  const tableRows = [];

  // Add custom styling options
  const tableStyles = {
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: [44, 62, 80],
      lineWidth: 0.1,
    },
    margin: { top: 20, bottom: 20, left: 10, right: 10 },
    columnStyles: {
      7: { cellWidth: 50 }, // Wider column for deliveryAddress
    },
  };

  // Add the logo and title to the header of the PDF
  doc.addImage(TastiGoLogo, 'PNG', 15, 10, 30, 30);
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(title, orientation === 'portrait' ? 105 : 148.5, 15, { align: 'center' });

  // Validate data
  if (!Array.isArray(data)) {
    console.error('Data is not an array:', data);
    return; // Exit if data is invalid
  }

  // Prepare table data dynamically based on columns
  data.forEach((item) => {
    const rowData = columns.map((col) => {
      // Handle date fields or other special cases if needed
      const value = item[col];
      return value instanceof Date ? value.toLocaleString() : value || '-';
    });
    tableRows.push(rowData);
  });

  // Format column headers with spaces
  const formattedHeaders = columns.map((col) => formatColumnName(col));

  // Generate table
  autoTable(doc, {
    head: [formattedHeaders],
    body: tableRows,
    ...tableStyles,
    startY: 40,
    didDrawPage: function (data) {
      if (data.pageNumber === 1) {
        doc.addImage(TastiGoLogo, 'PNG', 15, 10, 30, 30);
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(title, orientation === 'portrait' ? 105 : 148.5, 15, { align: 'center' });
      }
      doc.setFont('helvetica');
      doc.setFontSize(10);
      doc.text(
        'TastiGo',
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.setLineWidth(0.5);
      doc.line(
        20,
        doc.internal.pageSize.getHeight() - 15,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 15
      );
    },
  });

  doc.save(fileName + '.pdf');
  successMessage('Success', 'Your Report has been downloaded');
};

const OwnerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [, setRestaurants] = useState([]);
  const [ownerID, setOwnerID] = useState(null);
  const [, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPages, setCurrentPages] = useState({
    Pending: 1,
    Confirmed: 1,
    Prepared: 1,
    'On Delivery': 1,
    Completed: 1
  });
  const [activeStatus, setActiveStatus] = useState('Pending');
  const [completedFilter, setCompletedFilter] = useState('Today');
  const ordersPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.roleID === 'role2') {
          setOwnerID(decoded.userID);
        } else {
          setError('Unauthorized access: Not a Restaurant Owner');
        }
      } catch (err) {
        setError('Invalid token. Please log in again.');
      }
    } else {
      setError('No authentication token found.');
    }
  }, []);

  const fetchOrders = useCallback(async (restaurants) => {
    try {
      const token = localStorage.getItem('token');
      const restaurantIds = restaurants.map((r) => r._id);
      const response = await api.get('/api/order/orders', {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          restaurantId: restaurantIds,
          sortBy: sortField,
          order: sortOrder,
        },
      });

      setOrders(response.data.orders || []);
    } catch (err) {
      Toast({ type: 'error', message: 'Failed to load orders' });
      console.error(err);
    }
  }, [sortField, sortOrder]);

  const fetchRestaurants = useCallback(async (ownerID) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/restaurant/restaurants/owner/${ownerID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const approvedRestaurants = response.data.filter((r) => r.approvalStatus === 'approved');
      setRestaurants(approvedRestaurants);
      fetchOrders(approvedRestaurants); 
    } catch (err) {
      Toast({ type: 'error', message: 'Failed to load restaurants' });
    }
  }, [fetchOrders]);  

  useEffect(() => {
    if (ownerID) {
      fetchRestaurants(ownerID);
    }
  }, [ownerID, fetchRestaurants]); 

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPages({
      Pending: 1,
      Confirmed: 1,
      Prepared: 1,
      'On Delivery': 1,
      Completed: 1
    });
  };

  const handleUpdateStatus = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/api/order/orders/${orderId}/status/owner`,
        { status: 'Confirmed' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Toast({ type: 'success', message: 'Order status updated to Confirmed' });
      const restaurants = await api.get(`/api/restaurant/restaurants/owner/${ownerID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(restaurants.data.filter((r) => r.approvalStatus === 'approved'));
    } catch (err) {
      Toast({ type: 'error', message: 'Failed to update order status' });
      console.error(err);
    }
  };

  const handleUpdateStatusToPrepared = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/api/order/orders/${orderId}/status/owner`,
        { status: 'Prepared' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Toast({ type: 'success', message: 'Order status updated to Prepared' });
      const restaurants = await api.get(`/api/restaurant/restaurants/owner/${ownerID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders(restaurants.data.filter((r) => r.approvalStatus === 'approved'));
    } catch (err) {
      Toast({ type: 'error', message: 'Failed to update order status' });
      console.error(err);
    }
  };

  const handleDownloadCompletedReport = (period) => {
    const filteredOrders = filterCompletedOrders(period);
    
    if (filteredOrders.length === 0) {
      Toast({ type: 'error', message: `No completed orders for ${period.toLowerCase()}` });
      return;
    }

    const columns = [
      '_id',
      'restaurantName',
      'branchName',
      'userId',
      'totalAmount',
      'paymentStatus',
      'createdAt',
      'deliveryAddress'
    ];

    const data = filteredOrders.map((order) => ({
      _id: order._id,
      restaurantName: order.restaurantName,
      branchName: order.branchName,
      userId: order.userId,
      totalAmount: `LKR ${order.totalAmount}`,
      paymentStatus: order.paymentStatus,
      createdAt: new Date(order.createdAt),
      deliveryAddress: order.deliveryAddress
    }));

    generatePDF(columns, data, `Completed_Orders_${period.replace(/\s+/g, '_')}`, `Completed Orders - ${period}`, 'landscape');
  };

  const filterOrders = (status) => {
    let filtered = orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPayment =
        !paymentFilter || order.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();

      return order.orderStatus === status && matchesSearch && matchesPayment;
    });

    // Sort Pending and Confirmed orders by createdAt in ascending order (oldest first)
    // Sort other statuses by createdAt in descending order (latest first)
    if (status === 'Pending' || status === 'Confirmed') {
      filtered = filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  };

  const filterCompletedOrders = (period) => {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'Today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'Past 7 Days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'Past Month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'Past 3 Months':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'All Time':
        startDate = new Date(0); 
        break;
      default:
        startDate = new Date(0); 
    }

    return orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPayment =
        !paymentFilter || order.paymentStatus.toLowerCase() === paymentFilter.toLowerCase();

      const orderDate = new Date(order.createdAt);
      return (
        order.orderStatus === 'Completed' &&
        orderDate >= startDate &&
        matchesSearch &&
        matchesPayment
      );
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const renderTable = (status) => {
    if (status === 'Completed') {
      return renderCompletedTable();
    }

    const filteredOrders = filterOrders(status);
    const indexOfLastOrder = currentPages[status] * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => {
      setCurrentPages((prev) => ({ ...prev, [status]: pageNumber }));
    };

    return (
      <div className="order-status-section">
        <div className="order-status-header">
          <h4>{status} Orders</h4>
          {/*{status === 'Pending' && (
            <div className="sort-info">
              <small>Sorted by: {sortField} ({sortOrder === 'asc' ? 'Oldest First' : 'Newest First'})</small>
            </div>
          )}*/}
        </div>
        
        <div className="table-container">
          <table className="orders-data-table">
            <thead>
              <tr>
                <th>#</th>
                <th onClick={() => status === 'Pending' && handleSort('_id')} className={status === 'Pending' ? 'sortable' : ''}>
                  Order ID
                  {status === 'Pending' && (
                    <FontAwesomeIcon
                      icon={
                        sortField === '_id'
                          ? sortOrder === 'asc'
                            ? faSortUp
                            : faSortDown
                          : faSort
                      }
                      className="sort-icon"
                    />
                  )}
                </th>
                <th>Restaurant</th>
                <th>Branch</th>
                <th>User ID</th>
                <th onClick={() => status === 'Pending' && handleSort('totalAmount')} className={status === 'Pending' ? 'sortable' : ''}>
                  Total Amount
                  {status === 'Pending' && (
                    <FontAwesomeIcon
                      icon={
                        sortField === 'totalAmount'
                          ? sortOrder === 'asc'
                            ? faSortUp
                            : faSortDown
                          : faSort
                      }
                      className="sort-icon"
                    />
                  )}
                </th>
                <th>Payment Status</th>
                <th onClick={() => status === 'Pending' && handleSort('createdAt')} className={status === 'Pending' ? 'sortable' : ''}>
                  Created At
                  {status === 'Pending' && (
                    <FontAwesomeIcon
                      icon={
                        sortField === 'createdAt'
                          ? sortOrder === 'asc'
                            ? faSortUp
                            : faSortDown
                          : faSort
                      }
                      className="sort-icon"
                    />
                  )}
                </th>
                <th>Delivery Address</th>
                {status === 'Pending' && <th>Confirm</th>}
                {status === 'Confirmed' && <th>Mark as Prepared</th>}
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={status === 'Pending' || status === 'Confirmed' ? 10 : 9} className="no-orders">
                    No {status.toLowerCase()} orders found.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, index) => (
                  <tr key={order._id}>
                    <td>{indexOfFirstOrder + index + 1}</td>
                    <td>{order._id}</td>
                    <td>{order.restaurantName}</td>
                    <td>{order.branchName}</td>
                    <td>{order.userId}</td>
                    <td>LKR {order.totalAmount}</td>
                    <td className="payment-status-cell">
                      <span
                        className={`order-payment-status order-payment-status-${
                          order.paymentStatus.toLowerCase()
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.deliveryAddress}</td>
                    {status === 'Pending' && (
                    <td
                      className="action-cell"
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        className="action-button-confirm"
                        onClick={() => handleUpdateStatus(order._id)}
                        title="Confirm Order"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    </td>
                  )}
                  {status === 'Confirmed' && (
                    <td
                      className="action-cell"
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <button
                        className="action-button-confirm"
                        onClick={() => handleUpdateStatusToPrepared(order._id)}
                        title="Mark as Prepared"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    </td>
                  )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <Pagination className="orders-pagination">
            <Pagination.First
              onClick={() => paginate(1)}
              disabled={currentPages[status] === 1}
            />
            <Pagination.Prev
              onClick={() => paginate(currentPages[status] - 1)}
              disabled={currentPages[status] === 1}
            />
            {[...Array(totalPages).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPages[status]}
                onClick={() => paginate(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => paginate(currentPages[status] + 1)}
              disabled={currentPages[status] === totalPages}
            />
            <Pagination.Last
              onClick={() => paginate(totalPages)}
              disabled={currentPages[status] === totalPages}
            />
          </Pagination>
        )}
      </div>
    );
  };

  const renderCompletedTable = () => {
    const filteredOrders = filterCompletedOrders(completedFilter);
    const indexOfLastOrder = currentPages.Completed * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => {
      setCurrentPages((prev) => ({ ...prev, Completed: pageNumber }));
    };

    return (
      <div className="completed-orders-section">
        <div className="completed-orders-header">
          <h4>Completed Orders</h4>
          <div className="completed-filter-buttons">
            {['Today', 'Past 7 Days', 'Past Month', 'Past 3 Months', 'All Time'].map((period) => (
              <button
                key={period}
                className={`completed-filter-btn ${completedFilter === period ? 'active' : ''}`}
                onClick={() => {
                  setCompletedFilter(period);
                  setCurrentPages((prev) => ({ ...prev, Completed: 1 }));
                }}
              >
                {period}
              </button>
            ))}
            <button
              className="completed-download-btn"
              onClick={() => handleDownloadCompletedReport(completedFilter)}
            >
              <FontAwesomeIcon icon={faDownload} />
              Download {completedFilter} Report
            </button>
          </div>
        </div>
        
        <div className="table-container">
          <table className="orders-data-table completed-orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Restaurant</th>
                <th>Branch</th>
                <th>User ID</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Completed At</th>
                <th>Delivery Address</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-orders">
                    No completed orders found for {completedFilter.toLowerCase()}.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, index) => (
                  <tr key={order._id} className="completed-order-row">
                    <td>{indexOfFirstOrder + index + 1}</td>
                    <td>{order._id}</td>
                    <td>{order.restaurantName}</td>
                    <td>{order.branchName}</td>
                    <td>{order.userId}</td>
                    <td>LKR {order.totalAmount}</td>
                    <td className="payment-status-cell">
                      <span
                        className={`order-payment-status order-payment-status-${
                          order.paymentStatus.toLowerCase()
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.deliveryAddress}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <Pagination className="orders-pagination">
            <Pagination.First
              onClick={() => paginate(1)}
              disabled={currentPages.Completed === 1}
            />
            <Pagination.Prev
              onClick={() => paginate(currentPages.Completed - 1)}
              disabled={currentPages.Completed === 1}
            />
            {[...Array(totalPages).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPages.Completed}
                onClick={() => paginate(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => paginate(currentPages.Completed + 1)}
              disabled={currentPages.Completed === totalPages}
            />
            <Pagination.Last
              onClick={() => paginate(totalPages)}
              disabled={currentPages.Completed === totalPages}
            />
          </Pagination>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="owner-orders-container">
      <RestaurantOwnerSidebar />
      <div className="orders-main-content">
        <h1>Manage Orders</h1>

        {/* Search and Filter Section */}
        <div className="orders-search-filter">
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by order ID, restaurant, or user ID"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPages({
                      Pending: 1,
                      Confirmed: 1,
                      Prepared: 1,
                      'On Delivery': 1,
                      Completed: 1
                    });
                  }}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex justify-content-end align-items-center">
              <Form.Select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setCurrentPages({
                    Pending: 1,
                    Confirmed: 1,
                    Prepared: 1,
                    'On Delivery': 1,
                    Completed: 1
                  });
                }}
                className="payment-filter-select"
              >
                <option value="">All Payment Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </Form.Select>
              <Button
                variant="primary"
                onClick={() => handleDownloadCompletedReport('All Time')}
                className="download-all-btn"
              >
                <FontAwesomeIcon icon={faDownload} />
                All Completed Orders Report
              </Button>
            </Col>
          </Row>
        </div>

        {/* Status Tabs */}
        <Tabs
          activeKey={activeStatus}
          onSelect={(k) => setActiveStatus(k)}
          className="mb-3 orders-status-tabs"
          fill
        >
          {['Pending', 'Confirmed', 'Prepared', 'On Delivery', 'Completed'].map((status) => (
            <Tab
              key={status}
              eventKey={status}
              title={
                <div className="status-tab-title">
                  {status}
                  {filterOrders(status).length > 0 && (
                    <span className="order-count-badge">
                      {filterOrders(status).length}
                    </span>
                  )}
                </div>
              }
            >
              <div className="order-tab-content">
                {renderTable(status)}
              </div>
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerOrdersPage;