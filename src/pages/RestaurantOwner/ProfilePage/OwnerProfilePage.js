import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './OwnerProfilePage.css';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';
import RestaurantOwnerSidebar from '../../../components/RestaurantOwnerSidebar/RestaurantOwnerSidebar';
import LoadingGIF from '../../../assets/GIF/loading.gif';
import api from '../../../api';

const OwnerProfilePage = () => {
    const [ownerId, setOwnerId] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        mobileNumber: '',
    });
    const [error, setError] = useState(null);
    const [mobileError, setMobileError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch ownerId from JWT token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.roleID !== 'role2') {
                    setError('Unauthorized access: Not a Restaurant Owner');
                    setLoading(false);
                } else {
                    setOwnerId(decodedToken.userID);
                }
            } catch (err) {
                console.error('Error decoding token:', err);
                setError('Failed to retrieve owner information. Please log in again.');
                setLoading(false);
            }
        } else {
            setError('No authentication token found. Please log in.');
            setLoading(false);
        }
    }, []);

    // Fetch owner profile when ownerId is available
    useEffect(() => {
        if (!ownerId || error) return;

        const fetchOwnerDetails = async () => {
            try {
                const response = await api.get(`/api/users/owners/${ownerId}/profile`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                if (response.data.success) {
                    setProfile({
                        name: response.data.owner.name || '',
                        email: response.data.owner.email || '',
                        mobileNumber: response.data.owner.mobileNumber || '',
                    });
                } else {
                    setError('Failed to load profile. Please try again.');
                }
            } catch (err) {
                console.error('Error fetching owner profile:', err);
                setError('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOwnerDetails();
    }, [ownerId, error]);

    const handleEdit = () => {
        setIsEditing(true);
        setMobileError(null); // Clear any previous mobile number errors
    };

    const handleSave = async () => {
        try {
            const response = await api.put(`/api/users/owners/${ownerId}/profile`, profile, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (response.data.success) {
                setIsEditing(false);
                setMobileError(null);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            if (err.response?.data?.message === 'Mobile number already exists') {
                setMobileError('This mobile number is already registered.');
            } else {
                setError('Failed to update profile. Please try again.');
            }
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
        if (e.target.name === 'mobileNumber') {
            setMobileError(null); // Clear mobile error when user types
        }
    };

    if (error) {
        return (
            <div className="profile-page-wrapper">
                <RestaurantOwnerSidebar />
                <div className="profile-content-area">
                    <h3 className="profile-error-text">Failed to load profile. Please try again.</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page-wrapper">
            <RestaurantOwnerSidebar />
            <div className="profile-content-area">
                <Container fluid className="profile-main-container">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="profile-title"
                    >
                        Owner Profile
                    </motion.h2>
                    {loading ? (
                        <div className="profile-loading">
                            <img
                                src={LoadingGIF}
                                alt="Loading..."
                                className="profile-loading-gif"
                            />
                        </div>
                    ) : (
                        <Row className="justify-content-center mt-4">
                            <Col md={8} lg={6}>
                                <Card className="profile-info-card">
                                    <Card.Body>
                                        <Card.Title className="profile-card-title">Profile Details</Card.Title>
                                        <Form>
                                            <Form.Group className="mb-3 profile-form-group">
                                                <Form.Label className="profile-form-label">Name</Form.Label>
                                                {isEditing ? (
                                                    <Form.Control
                                                        type="text"
                                                        name="name"
                                                        value={profile.name}
                                                        onChange={handleChange}
                                                        className="profile-form-input"
                                                    />
                                                ) : (
                                                    <Form.Control
                                                        type="text"
                                                        value={profile.name}
                                                        readOnly
                                                        plaintext
                                                        className="profile-form-display"
                                                    />
                                                )}
                                            </Form.Group>
                                            <Form.Group className="mb-3 profile-form-group">
                                                <Form.Label className="profile-form-label">Email</Form.Label>
                                                {isEditing ? (
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={profile.email}
                                                        onChange={handleChange}
                                                        className="profile-form-input"
                                                        disabled
                                                    />
                                                ) : (
                                                    <Form.Control
                                                        type="email"
                                                        value={profile.email}
                                                        readOnly
                                                        plaintext
                                                        className="profile-form-display"
                                                    />
                                                )}
                                            </Form.Group>
                                            <Form.Group className="mb-3 profile-form-group">
                                                <Form.Label className="profile-form-label">Mobile Number</Form.Label>
                                                {isEditing ? (
                                                    <Form.Control
                                                        type="tel"
                                                        name="mobileNumber"
                                                        value={profile.mobileNumber}
                                                        onChange={handleChange}
                                                        className="profile-form-input"
                                                        isInvalid={!!mobileError}
                                                    />
                                                ) : (
                                                    <Form.Control
                                                        type="tel"
                                                        value={profile.mobileNumber}
                                                        readOnly
                                                        plaintext
                                                        className="profile-form-display"
                                                    />
                                                )}
                                                {mobileError && (
                                                    <Form.Control.Feedback type="invalid">
                                                        {mobileError}
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                            <div className="profile-action-buttons">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            variant="primary"
                                                            onClick={handleSave}
                                                            className="profile-save-btn me-2"
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            onClick={() => {
                                                                setIsEditing(false);
                                                                setMobileError(null);
                                                            }}
                                                            className="profile-cancel-btn"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        onClick={handleEdit}
                                                        className="profile-edit-btn"
                                                    >
                                                        Edit Profile
                                                    </Button>
                                                )}
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Container>
            </div>
        </div>
    );
};

export default OwnerProfilePage;