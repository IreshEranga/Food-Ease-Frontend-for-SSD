import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../../api';
import Toast from '../../../utils/toast';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');
  const userID = query.get('userID');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/users/auth/reset-password', {
        userID,
        token,
        password,
      });
      setMessage(response.data.message);
      Toast({ type: 'success', message: 'Password Reset Success!' });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      Toast({ type: 'error', message: 'Something went wrong, Please try again!' });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="reset-password-container d-flex justify-content-center align-items-center"
    >
      <Card className="reset-password-card shadow">
        <Card.Body>
          <h2 className="text-center mb-4">Reset Password</h2>
          <p className="text-center text-muted mb-4">
            Enter a new password for your account.
          </p>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="password" className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength="6"
                aria-describedby="passwordHelp"
              />
            </Form.Group>
            <Form.Group controlId="confirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength="6"
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3"
              disabled={loading || !token || !userID}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <Link to="/login" className="text-decoration-none">
              Back to Login
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPassword;