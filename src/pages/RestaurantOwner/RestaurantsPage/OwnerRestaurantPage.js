import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../../api';
import AddRestaurantForm from './AddRestaurantForm';
import EditRestaurantForm from './EditRestaurantForm';
import RestaurantOwnerSidebar from '../../../components/RestaurantOwnerSidebar/RestaurantOwnerSidebar';
import './OwnerRestaurantPage.css';
import Toast from '../../../utils/toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faTrashCan, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Form, Row, Col, InputGroup, Button, Pagination } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { successMessage } from '../../../utils/Alert';
import TastiGoLogo from '../../../assets/Images/T.png';

const formatColumnName = (col) => {
  return col
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const generatePDF = (columns, data, fileName, title = 'Report', orientation = 'landscape') => {
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4',
    lineHeight: 1.2,
  });

  const tableRows = [];

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
      3: { cellWidth: 50 },
    },
  };

  doc.addImage(TastiGoLogo, 'PNG', 15, 10, 30, 30);
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(title, orientation === 'portrait' ? 105 : 148.5, 15, { align: 'center' });

  if (!Array.isArray(data)) {
    console.error('Data is not an array:', data);
    return;
  }

  data.forEach((item) => {
    const rowData = columns.map((col) => {
      const value = item[col];
      return value instanceof Date ? value.toLocaleString() : value || '-';
    });
    tableRows.push(rowData);
  });

  const formattedHeaders = columns.map((col) => formatColumnName(col));

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

const OwnerRestaurantPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedRestaurant,] = useState(null);
  const [, setError] = useState(null);
  const [ownerID, setOwnerID] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [activeTable, setActiveTable] = useState('Approved');
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setOwnerID(decodedToken.userID);
        if (decodedToken.roleID !== 'role2') {
          setError('Unauthorized access: Not a Restaurant Owner');
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        setError('Failed to retrieve owner information');
      }
    } else {
      setError('No authentication token found. Please log in.');
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await api.get(`/api/restaurant/restaurants/owner/${ownerID}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRestaurants(response.data);
    } catch (err) {
      Toast({ type: 'error', message: 'Failed to fetch restaurants. Please try again.' });
      setError(err.response?.data?.message || 'Failed to fetch restaurants.');
    }
  }, [ownerID]);

  useEffect(() => {
    if (ownerID) {
      fetchRestaurants();
    }
  }, [ownerID, fetchRestaurants]);

  const handleStatusChange = async (restaurantId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      await api.patch(`/api/restaurant/restaurants/${restaurantId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Toast({ type: 'success', message: `Restaurant status updated to ${newStatus}` });
      fetchRestaurants();
    } catch (err) {
      console.error('Status Change Error:', err.response || err);
      const errorMessage = err.response?.data?.message || 'Failed to update restaurant status';
      Toast({ type: 'error', message: errorMessage });
      setError(errorMessage);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        await api.delete(`/api/restaurant/restaurants/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Toast({ type: 'success', message: 'Restaurant deleted successfully' });
        fetchRestaurants();
      } catch (err) {
        console.error('Delete Error:', err.response || err);
        const errorMessage = err.response?.data?.message || 'Failed to delete restaurant';
        Toast({ type: 'error', message: errorMessage });
        setError(errorMessage);
      }
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter || restaurant.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesApproval =
      !approvalFilter || restaurant.approvalStatus.toLowerCase() === approvalFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const approvedRestaurants = filteredRestaurants.filter(
    (restaurant) => restaurant.approvalStatus === 'approved'
  );
  const notApprovedRestaurants = filteredRestaurants.filter(
    (restaurant) => restaurant.approvalStatus !== 'approved'
  );

  const indexOfLastRestaurant = currentPage * restaurantsPerPage;
  const indexOfFirstRestaurant = indexOfLastRestaurant - restaurantsPerPage;
  const currentApprovedRestaurants = approvedRestaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);
  const currentNotApprovedRestaurants = notApprovedRestaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);
  const totalApprovedPages = Math.ceil(approvedRestaurants.length / restaurantsPerPage);
  const totalNotApprovedPages = Math.ceil(notApprovedRestaurants.length / restaurantsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderOperatingHours = (operatingHours) => {
    if (!operatingHours) return null;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return days.map(day => {
      const hours = operatingHours[day];
      if (!hours) return <td key={day}>Closed</td>;
      
      return (
        <td key={day}>
          {hours.open} - {hours.close}
        </td>
      );
    });
  };

  const renderTable = (tableType) => {
    const restaurantsToDisplay = tableType === 'Approved' ? currentApprovedRestaurants : currentNotApprovedRestaurants;
    const totalPages = tableType === 'Approved' ? totalApprovedPages : totalNotApprovedPages;
    const isApprovedTable = tableType === 'Approved';

    return (
      <>
        <h4 style={{ paddingTop: '20px' }}>{tableType} Restaurants</h4>
        <div className="restaurant-table-container">
          <table className="restaurant-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Address</th>
                <th>Cuisine</th>
                <th>Image</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>Sat</th>
                <th>Sun</th>
                {isApprovedTable ? <th className="status-column">Status</th> : <th>Approval Status</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurantsToDisplay.length === 0 ? (
                <tr>
                  <td colSpan={16} style={{ textAlign: 'center', padding: '20px' }}>
                    No {tableType.toLowerCase()} restaurants found.
                  </td>
                </tr>
              ) : (
                restaurantsToDisplay.map((restaurant) => (
                  <tr key={restaurant.restaurantId}>
                    <td>{restaurant.restaurantId}</td>
                    <td>{restaurant.restaurantName}</td>
                    <td>{restaurant.branchName}</td>
                    <td>{restaurant.address.fullAddress}</td>
                    <td>{restaurant.cuisineType.join(', ')}</td>
                    <td>
                      {restaurant.restaurantImage ? (
                        <img
                          src={restaurant.restaurantImage}
                          alt={restaurant.restaurantName}
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    {renderOperatingHours(restaurant.operatingHours)}
                    {isApprovedTable ? (
                      <td className="status-column">
                        <select
                          value={restaurant.status}
                          onChange={(e) =>
                            handleStatusChange(restaurant.restaurantId, e.target.value)
                          }
                        >
                          <option value="open">Open</option>
                          <option value="close">Close</option>
                          <option value="temporarily_closed">Temporarily Closed</option>
                        </select>
                      </td>
                    ) : (
                      <td>{restaurant.approvalStatus}</td>
                    )}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="action-button-delete"
                        onClick={() => handleDeleteRestaurant(restaurant.restaurantId)}
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination className="restaurant-pagination">
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
      </>
    );
  };

  const handleDownloadReport = () => {
    const columns = [
      'restaurantId',
      'restaurantName',
      'branchName',
      'address',
      'cuisineType',
      'mon',
      'tue',
      'wed',
      'thur',
      'fri',
      'sat',
      'sun',
      'status'
    ];
    const data = approvedRestaurants.map((restaurant) => ({
      restaurantId: restaurant.restaurantId,
      restaurantName: restaurant.restaurantName,
      branchName: restaurant.branchName,
      address: restaurant.address.fullAddress,
      cuisineType: restaurant.cuisineType.join(', '),
      mon: restaurant.operatingHours?.monday ? `${restaurant.operatingHours.monday.open} - ${restaurant.operatingHours.monday.close}` : 'Closed',
      tue: restaurant.operatingHours?.tuesday ? `${restaurant.operatingHours.tuesday.open} - ${restaurant.operatingHours.tuesday.close}` : 'Closed',
      wed: restaurant.operatingHours?.wednesday ? `${restaurant.operatingHours.wednesday.open} - ${restaurant.operatingHours.wednesday.close}` : 'Closed',
      thur: restaurant.operatingHours?.thursday ? `${restaurant.operatingHours.thursday.open} - ${restaurant.operatingHours.thursday.close}` : 'Closed',
      fri: restaurant.operatingHours?.friday ? `${restaurant.operatingHours.friday.open} - ${restaurant.operatingHours.friday.close}` : 'Closed',
      sat: restaurant.operatingHours?.saturday ? `${restaurant.operatingHours.saturday.open} - ${restaurant.operatingHours.saturday.close}` : 'Closed',
      sun: restaurant.operatingHours?.sunday ? `${restaurant.operatingHours.sunday.open} - ${restaurant.operatingHours.sunday.close}` : 'Closed',
      status: restaurant.status,
    }));

    generatePDF(columns, data, 'Approved_Restaurants_Report', 'Approved Restaurants Report', 'landscape');
  };

  return (
    <div className="owner-restaurant-container">
      <RestaurantOwnerSidebar />
      <div className="restaurant-main-content">
        <h1 style={{ marginBottom: '30px' }}>My Restaurants</h1>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            className="action-btn-add"
            onClick={() => setShowAddForm(true)}
            title="Add Restaurant"
          >
            <FontAwesomeIcon icon={faPlusSquare} style={{ marginRight: '8px' }} />
            Add New Restaurant
          </button>

          <button
            className="action-btn-add"
            style={{ backgroundColor: '#28a745' }}
            onClick={handleDownloadReport}
            title="Download Approved Restaurants Report"
          >
            <FontAwesomeIcon icon={faDownload} style={{ marginRight: '8px' }} />
            Approved Restaurants Report
          </button>
        </div>

        <Row className="mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by name or branch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={6} className="d-flex justify-content-end">
            <Form.Select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="me-2"
              style={{ maxWidth: '180px' }}
            >
              <option value="">All Approvals</option>
              <option value="approved">Approved</option>
              <option value="not_approved">Not Approved</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: '150px' }}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="close">Close</option>
              <option value="temporarily_closed">Temporarily Closed</option>
            </Form.Select>
          </Col>
        </Row>

        {showAddForm && (
          <AddRestaurantForm
            show={showAddForm}
            onClose={() => {
              setShowAddForm(false);
              fetchRestaurants();
            }}
            ownerID={ownerID}
          />
        )}

        {showEditForm && (
          <EditRestaurantForm
            show={showEditForm}
            onClose={() => setShowEditForm(false)}
            restaurant={selectedRestaurant}
            onUpdate={fetchRestaurants}
          />
        )}

        <div className="status-toggle-buttons mb-3">
          {['Approved', 'Pending/Rejected'].map((tableType) => (
            <Button
              key={tableType}
              variant={activeTable === tableType ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTable(tableType)}
              className="me-2"
            >
              {tableType}
            </Button>
          ))}
        </div>

        {renderTable(activeTable)}
      </div>
    </div>
  );
};

export default OwnerRestaurantPage;