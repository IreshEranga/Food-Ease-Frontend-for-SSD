import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../../../api';
import Toast from '../../../utils/toast';

function AddRole({ show, handleClose, onRoleAdded }) {
  const [roleType, setRoleType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddRole = async () => {
    if (!roleType.trim()) {
      setError('Role type is required.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/users/roles', {
        roleType
      });

      if (response.data || response.status === 201) {
        onRoleAdded(); 
        setRoleType('');
        setError('');
        handleClose();

        Toast({ type: 'success', message: 'Role added successfully!' });
      } else {
        setError('Failed to add role');
      }
    } catch (err) {
      console.error('Add role error:', err);
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal className="addRole-modal" show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="addRole-title">Add New Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="roleType">
            <Form.Label className="addRole-label">Role Type</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter role type"
              className="addRole-input"
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              isInvalid={!!error}
            />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button className="addRole-closeBtn" variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          className="addRole-submitBtn"
          variant="primary"
          onClick={handleAddRole}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Role'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddRole;
