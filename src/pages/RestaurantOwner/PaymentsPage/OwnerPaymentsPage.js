import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../../api';
import RestaurantOwnerSidebar from '../../../components/RestaurantOwnerSidebar/RestaurantOwnerSidebar';
import Toast from '../../../utils/toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Form, Row, Col, Table, InputGroup, Pagination, Button, ButtonGroup } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { successMessage } from '../../../utils/Alert';
import TastiGoLogo from '../../../assets/Images/T.png';
import './OwnerPaymentsPage.css';

// Helper function to format column names
const formatColumnName = (col) => {
  return col
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim(); // Remove leading/trailing spaces
};

const generatePDF = (columns, data, fileName, title = 'Report') => {
  const doc = new jsPDF({
    orientation: 'portrait',
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
  };

  // Add the logo and title to the header of the PDF
  doc.addImage(TastiGoLogo, 'PNG', 15, 10, 30, 30);
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 105, 15, { align: 'center' });

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
        doc.text(title, 105, 15, { align: 'center' });
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

const OwnerPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [ownerID, setOwnerID] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [timeFilter, setTimeFilter] = useState('today'); 
  const paymentsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.roleID === 'role2') {
          setOwnerID(decoded.userID);
        } else {
          Toast({ type: 'error', message: 'Unauthorized access: Not a Restaurant Owner' });
        }
      } catch (err) {
        Toast({ type: 'error', message: 'Invalid token. Please log in again.' });
      }
    } else {
      Toast({ type: 'error', message: 'No authentication token found.' });
    }
  }, []);

  const fetchPayments = useCallback(async (restaurants) => {
    try {
      const token = localStorage.getItem('token');
      const restaurantIds = restaurants.map(r => r._id);
      const response = await api.get('/api/order/orders', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          restaurantId: restaurantIds,
          sortBy: sortField,
          order: sortOrder
        }
      });

      let paidOrders = (response.data.orders || []).filter(order => order.paymentStatus === 'Paid' || order.paymentStatus === 'paid');

      // Apply time filter
      const now = new Date();
      if (timeFilter === 'today') {
        paidOrders = paidOrders.filter(order => 
          new Date(order.createdAt).toDateString() === now.toDateString()
        );
      } else if (timeFilter === 'week') {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        paidOrders = paidOrders.filter(order => 
          new Date(order.createdAt) >= oneWeekAgo
        );
      } else if (timeFilter === 'month') {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        paidOrders = paidOrders.filter(order => 
          new Date(order.createdAt) >= oneMonthAgo
        );
      } else if (timeFilter === 'threeMonths') {
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
        paidOrders = paidOrders.filter(order => 
          new Date(order.createdAt) >= threeMonthsAgo
        );
      }

      setPayments(paidOrders);
    } catch (err) {
      Toast({ type: 'error', message: 'Failed to load payments' });
      console.error(err);
    }
  }, [sortField, sortOrder, timeFilter]);

  const fetchRestaurants = useCallback(async (ownerID) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/restaurant/restaurants/owner/${ownerID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const approvedRestaurants = response.data.filter(r => r.approvalStatus === 'approved');
      fetchPayments(approvedRestaurants);
    } catch (err) {
      Toast({ type: 'error', message: 'Failed to load restaurants' });
      console.error(err);
    }
  }, [fetchPayments]);

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
    setCurrentPage(1);
  };

  const filteredPayments = payments.filter(payment => 
    payment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleTimeFilter = (filter) => {
    setTimeFilter(filter);
    setCurrentPage(1);
  };

  const handleDownloadReport = () => {
    if (filteredPayments.length === 0) {
      Toast({ type: 'error', message: `No paid orders found for ${timeFilter === 'today' ? 'today' : timeFilter === 'week' ? 'past 7 days' : timeFilter === 'month' ? 'past month' : timeFilter === 'threeMonths' ? 'past 3 months' : 'all time'}` });
      return;
    }

    const columns = [
      '_id',
      'restaurantName',
      'branchName',
      'userId',
      'totalAmount',
      'paymentStatus',
      'createdAt'
    ];

    const data = filteredPayments.map((payment) => ({
      _id: payment._id,
      restaurantName: payment.restaurantName,
      branchName: payment.branchName,
      userId: payment.userId,
      totalAmount: `LKR ${payment.totalAmount.toFixed(2)}`,
      paymentStatus: payment.paymentStatus,
      createdAt: new Date(payment.createdAt)
    }));

    const filterTitleMap = {
      today: 'Today',
      week: 'Past 7 Days',
      month: 'Past Month',
      threeMonths: 'Past 3 Months',
      all: 'All Time'
    };

    const title = `Paid Orders - ${filterTitleMap[timeFilter]}`;
    const fileName = `Paid_Orders_${filterTitleMap[timeFilter].replace(/\s+/g, '_')}`;
    generatePDF(columns, data, fileName, title);
  };

  return (
    <div className="owner-payments-container">
      <RestaurantOwnerSidebar />
      <div className="owner-payments-main-content">
        <h1 style={{textAlign:'center', marginBottom:'30px'}}>Payments (Paid Orders)</h1>
  
        <Row className="owner-payments-search-bar mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by Order ID, Restaurant Name, Branch Name, User ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <ButtonGroup className="time-filter-buttons">
              <Button
                variant={timeFilter === 'today' ? 'primary' : 'outline-primary'}
                onClick={() => handleTimeFilter('today')}
                className="time-filter-button"
              >
                Today
              </Button>
              <Button
                variant={timeFilter === 'week' ? 'primary' : 'outline-primary'}
                onClick={() => handleTimeFilter('week')}
                className="time-filter-button"
              >
                Past 7 Days
              </Button>
              <Button
                variant={timeFilter === 'month' ? 'primary' : 'outline-primary'}
                onClick={() => handleTimeFilter('month')}
                className="time-filter-button"
              >
                Past Month
              </Button>
              <Button
                variant={timeFilter === 'threeMonths' ? 'primary' : 'outline-primary'}
                onClick={() => handleTimeFilter('threeMonths')}
                className="time-filter-button"
              >
                Past 3 Months
              </Button>
              <Button
                variant={timeFilter === 'all' ? 'primary' : 'outline-primary'}
                onClick={() => handleTimeFilter('all')}
                className="time-filter-button"
              >
                All
              </Button>
              <Button
                variant="success"
                onClick={handleDownloadReport}
                className="time-filter-button"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FontAwesomeIcon icon={faDownload} />
                Download Report
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
  
        <div className="table-container">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th onClick={() => handleSort('_id')} className="sortable">
                  Order ID <FontAwesomeIcon icon={sortField === '_id' ? (sortOrder === 'asc' ? faSortUp : faSortDown) : faSort} className="sort-icon" />
                </th>
                <th onClick={() => handleSort('restaurantName')} className="sortable">
                  Restaurant Name <FontAwesomeIcon icon={sortField === 'restaurantName' ? (sortOrder === 'asc' ? faSortUp : faSortDown) : faSort} className="sort-icon" />
                </th>
                <th>Branch Name</th>
                <th>User ID</th>
                <th>Total Amount (LKR)</th>
                <th>Payment Status</th>
                <th onClick={() => handleSort('createdAt')} className="sortable">
                  Paid At <FontAwesomeIcon icon={sortField === 'createdAt' ? (sortOrder === 'asc' ? faSortUp : faSortDown) : faSort} className="sort-icon" />
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No paid orders found.</td>
                </tr>
              ) : (
                currentPayments.map(payment => (
                  <tr key={payment._id}>
                    <td>{payment._id}</td>
                    <td>{payment.restaurantName}</td>
                    <td>{payment.branchName}</td>
                    <td>{payment.userId}</td>
                    <td>{payment.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`owner-payment-status ${payment.paymentStatus.toLowerCase() === 'paid' ? 'owner-payment-status-paid' : 'owner-payment-status-unpaid'}`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
  
        {totalPages > 1 && (
          <Pagination className="owner-payments-pagination">
            <Pagination.Prev
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={idx + 1 === currentPage}
                onClick={() => paginate(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        )}
      </div>
    </div>
  );
};  

export default OwnerPaymentsPage;