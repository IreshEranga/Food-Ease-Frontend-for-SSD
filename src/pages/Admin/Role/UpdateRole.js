import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../../../api';
import Toast from '../../../utils/toast';

function UpdateRole({ show, handleClose, role, onRoleUpdated }) {
  const [roleType, setRoleType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) {
      setRoleType(role.roleType || '');
    }
  }, [role]);

  const handleUpdateRole = async () => {
    if (!roleType.trim()) {
      setError('Role type is required.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/api/users/roles/${role._id}`, {
        roleType,
      });

      if (response.status === 200 || response.data.success) {
        Toast({ type: 'success', message: 'Role updated successfully!' });
        handleClose();
        onRoleUpdated();
      } else {
        Toast({ type: 'error', message: 'Failed to update role.' });
      }
    } catch (err) {
      console.error('Update role error:', err);
      setError(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="updateRoleType">
            <Form.Label>Role Type</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter role type"
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              isInvalid={!!error}
            />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpdateRole} disabled={loading}>
          {loading ? 'Updating...' : 'Update Role'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UpdateRole;
