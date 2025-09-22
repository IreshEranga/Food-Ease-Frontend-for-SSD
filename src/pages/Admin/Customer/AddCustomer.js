import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../../../api';
import Toast from '../../../utils/toast';

function AddCustomer({ show, handleClose, onCustomerAdded }) {
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    address: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddCustomer = async () => {
    
    if (!customerData.name.trim() || !customerData.email.trim() || !customerData.password.trim()) {
      setError('Name, email, and password are required.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/users/auth/signup/customer', customerData);

      if (response.data || response.status === 201) {
        onCustomerAdded();
        setCustomerData({
          name: '',
          email: '',
          mobileNumber: '',
          address: '',
          password: '',
        }); 
        setError('');
        handleClose();

        Toast({ type: 'success', message: 'Customer added successfully!' });
      } else {
        setError('Failed to add customer');
      }
    } catch (err) {
      console.error('Add customer error:', err);
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal className="addCustomer-modal" show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="addCustomer-title">Add New Customer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="name">
            <Form.Label className="addCustomer-label">Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter customer name"
              className="addCustomer-input"
              value={customerData.name}
              onChange={handleInputChange}
              isInvalid={!!error && !customerData.name}
            />
          </Form.Group>

          <Form.Group controlId="email" className="mt-3">
            <Form.Label className="addCustomer-label">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              className="addCustomer-input"
              value={customerData.email}
              onChange={handleInputChange}
              isInvalid={!!error && !customerData.email}
            />
          </Form.Group>

          <Form.Group controlId="mobileNumber" className="mt-3">
            <Form.Label className="addCustomer-label">Mobile Number</Form.Label>
            <Form.Control
              type="text"
              name="mobileNumber"
              placeholder="Enter mobile number"
              className="addCustomer-input"
              value={customerData.mobileNumber}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="address" className="mt-3">
            <Form.Label className="addCustomer-label">Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              placeholder="Enter address"
              className="addCustomer-input"
              value={customerData.address}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group controlId="password" className="mt-3">
            <Form.Label className="addCustomer-label">Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter password"
              className="addCustomer-input"
              value={customerData.password}
              onChange={handleInputChange}
              isInvalid={!!error && !customerData.password}
            />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button className="addCustomer-closeBtn" variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          className="addCustomer-submitBtn"
          variant="primary"
          onClick={handleAddCustomer}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Customer'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddCustomer;