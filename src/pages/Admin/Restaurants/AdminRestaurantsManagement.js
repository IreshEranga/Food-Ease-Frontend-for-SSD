import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import AdminTableComponent from '../../../components/AdminTable/Table';
import api from '../../../api';
import Toast from '../../../utils/toast';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';

function AdminRestaurantsManagement() {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get('/api/restaurant/restaurants');
        setRestaurants(res.data);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      }
    };

    fetchRestaurants();
  }, []);

  const columns = [
    { label: 'Name', key: 'restaurantName' },
    { label: 'Branch', key: 'branchName' },
    { label: 'Status', key: 'status' },
    { label: 'Approval', key: 'approvalStatus' },
    { label: 'Address', key: 'address.fullAddress' },
    { label: 'Cuisines', key: 'cuisineType' },
    { label: 'License', key: 'licenseFile' },
  ];

  const formattedData = restaurants.map((r) => {
    const isPdf = r.licenseFile && r.licenseFile.toLowerCase().endsWith('.pdf');
    return {
      ...r,
      'address.fullAddress': r.address?.fullAddress || '',
      cuisineType: Array.isArray(r.cuisineType) ? r.cuisineType.join(', ') : r.cuisineType,
      licenseFile: r.licenseFile ? (
        <a href={r.licenseFile} target="_blank" rel="noreferrer">
          {isPdf ? 'View PDF' : 'View'}
        </a>
      ) : 'N/A',
    };
  });

  const filteredData = formattedData.filter((r) => {
    const matchesSearch =
      r.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.branchName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApproval =
      !approvalFilter || r.approvalStatus.toLowerCase() === approvalFilter.toLowerCase();

    const matchesStatus =
      !statusFilter || r.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesApproval && matchesStatus;
  });

  const handleEditApprovalStatus = async (row) => {
    if (row.approvalStatus === 'approved') {
      Toast({ type: 'error', message: 'Restaurant already approved. Cannot change status.' });
      return;
    }

    try {
      const newStatus = 'approved';
      await api.patch(
        `/api/restaurant/restaurants/${row.restaurantId}/approve`,
        { approvalStatus: newStatus }
      );

      setRestaurants((prev) =>
        prev.map((restaurant) =>
          restaurant.restaurantId === row.restaurantId
            ? { ...restaurant, approvalStatus: newStatus }
            : restaurant
        )
      );

      Toast({ type: 'success', message: 'Approval status updated successfully!' });
    } catch (err) {
      console.error('Failed to update approval status:', err);
      Toast({
        type: 'error',
        message: 'Error updating approval status: ' + (err.response?.data?.message || err.message),
      });
    }
  };

  const handleDelete = (row) => {
    console.log('Delete clicked', row);
    // Implement delete logic
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, backgroundColor: '#f5f5f5', padding: '20px' }}>
        <h1
          className="roleTitle bungee-spice-regular"
          style={{ textAlign: 'center', marginBottom: '30px' }}
        >
          Restaurants Management
        </h1>

        <Row className="mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by name or branch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                Clear
              </Button> */}
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
            </Form.Select>

            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: '150px' }}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="close">Close</option>
            </Form.Select>
          </Col>
        </Row>

        <AdminTableComponent
          columns={columns}
          data={filteredData}
          onEdit={handleEditApprovalStatus}
          onDelete={handleDelete}
          pageSize={5}
          disableEdit={(row) => row.approvalStatus === 'approved'}
        />
      </div>
    </div>
  );
}

export default AdminRestaurantsManagement;
