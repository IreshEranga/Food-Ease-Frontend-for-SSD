import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/AdminSidebar/AdminSidebar';
import AdminTableComponent from '../../../components/AdminTable/Table';
import api from '../../../api';
import { Container, Alert, Modal, Button, Form } from 'react-bootstrap';
import LoadingGIF from '../../../assets/GIF/loading.gif';
import Toast from '../../../utils/toast';
import { confirmMessage } from '../../../utils/Alert';

function DeliveryRiderManagement() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch driver data from API
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await api.get('/api/users/drivers');
        if (response.data.success) {
          setDrivers(response.data.data);
        } else {
          setError('Failed to fetch drivers');
        }
      } catch (err) {
        setError('Error fetching drivers: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  // Open modal and populate form with driver data
  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      mobileNumber: driver.mobileNumber,
      email: driver.email,
      vehicleNumber: driver.vehicleNumber,
      isAvailable: driver.isAvailable,
      status: driver.status,
    });
    setFormError(null);
    setShowModal(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDriver(null);
    setFormData({});
    setFormError(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Validate and submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    // Basic validation
    if (!formData.name || !formData.mobileNumber || !formData.email || !formData.vehicleNumber) {
      setFormError('All fields are required');
      setSubmitting(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      setFormError('Mobile number must be 10 digits');
      setSubmitting(false);
      return;
    }
    if (!/.+@.+\..+/.test(formData.email)) {
      setFormError('Invalid email format');
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.patch(`/api/users/drivers/${selectedDriver.riderID}`, formData);
      if (response.data.success) {
        // Update drivers state with the updated driver
        setDrivers((prev) =>
          prev.map((driver) =>
            driver.riderID === selectedDriver.riderID ? response.data.data : driver
          )
        );
        handleCloseModal();
        Toast({ type: 'success', message: 'Rider updated successfully!' });
      } else {
        setFormError(response.data.message || 'Failed to update driver');
      }
    } catch (err) {
      setFormError(err.message || 'Error updating driver');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete driver via API with confirmation
  const handleDelete = (driver) => {
    const deleteCallback = async () => {
      try {
        const response = await api.delete(`/api/users/drivers/${driver.riderID}`);
        if (response.data.success) {
          setDrivers(drivers.filter((d) => d.riderID !== driver.riderID));
          Toast({ type: 'success', message: 'Rider deleted successfully!' });
        } else {
          Toast({ type: 'error', message: response.data.message || 'Failed to delete driver' });
        }
      } catch (err) {
        Toast({ type: 'error', message: err.message || 'Error deleting driver' });
      }
    };
    confirmMessage('Are you sure?', "You won't be able to revert this!", deleteCallback);
  };

  // Table columns configuration
  const columns = [
    { key: 'riderID', label: 'Rider ID' },
    { key: 'name', label: 'Name' },
    { key: 'mobileNumber', label: 'Mobile Number' },
    { key: 'email', label: 'Email' },
    { key: 'vehicleNumber', label: 'Vehicle Number' },
    {
      key: 'isAvailable',
      label: 'Available',
      transform: (value) => (value ? 'Available' : 'Not Available'),
    },
    { key: 'status', label: 'Status' },
  ];

  // Disable edit/delete for non-inactive drivers
  const disableEdit = (driver) => driver.status !== 'inactive';

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ backgroundColor: '#f5f5f5' }}>
        <Container fluid>
          <h1
            className="roleTitle bungee-spice-regular"
            style={{ textAlign: 'center', marginTop: '5px', marginBottom: '30px' }}
          >
            Delivery Rider Management
          </h1>
          {loading ? (
            <div className="text-center">
              <img src={LoadingGIF} alt="Loading..." style={{ width: '40px', height: '40px' }} />
            </div>
          ) : error ? (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          ) : (
            <AdminTableComponent
              columns={columns}
              data={drivers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              pageSize={5}
              disableEdit={disableEdit}
            />
          )}

          {/* Bootstrap Modal for Editing Driver */}
          {selectedDriver && (
            <Modal show={showModal} onHide={handleCloseModal} centered>
              <Modal.Header closeButton>
                <Modal.Title>Edit Driver: {selectedDriver.name}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {formError && <Alert variant="danger">{formError}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formMobileNumber">
                    <Form.Label>Mobile Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="mobileNumber"
                      value={formData.mobileNumber || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formVehicleNumber">
                    <Form.Label>Vehicle Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formIsAvailable">
                    <Form.Check
                      type="checkbox"
                      name="isAvailable"
                      label="Available"
                      checked={formData.isAvailable || false}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status || ''}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on-delivery">On Delivery</option>
                    </Form.Select>
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Driver'}
                  </Button>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                  Cancel
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </Container>
      </div>
    </div>
  );
}

export default DeliveryRiderManagement;