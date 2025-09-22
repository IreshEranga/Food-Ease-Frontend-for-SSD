import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../../api';
import Toast from '../../../utils/toast';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/users/auth/forgot-password', { email });
      setMessage(response.data.message);
      Toast({ type: 'success', message: 'Password Reset Link send to your email!' });
      
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
      className="forgot-password-container d-flex justify-content-center align-items-center"
    >
      <Card className="forgot-password-card shadow">
        <Card.Body>
          <h2 className="text-center mb-4">Forgot Password</h2>
          <p className="text-center text-muted mb-4">
            Enter your email to receive a password reset link.
          </p>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                aria-describedby="emailHelp"
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3"
              disabled={loading}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} 
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;