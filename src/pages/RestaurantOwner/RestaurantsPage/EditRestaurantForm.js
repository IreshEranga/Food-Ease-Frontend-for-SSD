import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import api from '../../../api';
import Toast from '../../../utils/toast';
import './EditRestaurantForm.css';

const EditRestaurantForm = ({ show, onClose, restaurant, onUpdate }) => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    branchName: '',
    address: {
      fullAddress: '',
      coordinates: { lat: '', lng: '' },
    },
    cuisineType: [],
    operatingHours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' },
    },
    restaurantImage: null,
    licenseFile: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewLicense, setPreviewLicense] = useState(null);

  // Cuisine options for the multi-select
  const cuisineOptions = [
    'Italian', 'Chinese', 'Mexican', 'Indian', 'French', 'Japanese', 'Thai', 'American',
    'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Spanish', 'German', 'Brazilian', 'Other'
  ];

  // Initialize form with restaurant data
  useEffect(() => {
    if (restaurant) {
      console.log('Received restaurant data:', restaurant); // Log restaurant data
      if (!restaurant.restaurantId) {
        console.error('Restaurant ID is missing:', restaurant);
        Toast({ type: 'error', message: 'Invalid restaurant data. Please try again.' });
        onClose();
        return;
      }
      setFormData({
        restaurantName: restaurant.restaurantName || '',
        branchName: restaurant.branchName || '',
        address: {
          fullAddress: restaurant.address?.fullAddress || '',
          coordinates: {
            lat: restaurant.address?.coordinates?.lat || '',
            lng: restaurant.address?.coordinates?.lng || '',
          },
        },
        cuisineType: restaurant.cuisineType || [],
        operatingHours: restaurant.operatingHours || {
          monday: { open: '', close: '' },
          tuesday: { open: '', close: '' },
          wednesday: { open: '', close: '' },
          thursday: { open: '', close: '' },
          friday: { open: '', close: '' },
          saturday: { open: '', close: '' },
          sunday: { open: '', close: '' },
        },
        restaurantImage: restaurant.restaurantImage || null,
        licenseFile: restaurant.licenseFile || null,
      });
      setPreviewImage(restaurant.restaurantImage || null);
      setPreviewLicense(restaurant.licenseFile || null);
    }
  }, [restaurant, onClose]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (name.includes('coordinates.')) {
      const field = name.split('.')[2];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          coordinates: { ...prev.address.coordinates, [field]: value },
        },
      }));
    } else if (name.includes('operatingHours.')) {
      const [day, field] = name.split('.').slice(1);
      setFormData((prev) => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [day]: { ...prev.operatingHours[day], [field]: value },
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle cuisine type multi-select
  const handleCuisineChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, cuisineType: selected }));
    setErrors((prev) => ({ ...prev, cuisineType: '' }));
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));
      if (name === 'restaurantImage') {
        setPreviewImage(URL.createObjectURL(file));
      } else if (name === 'licenseFile') {
        setPreviewLicense(URL.createObjectURL(file));
      }
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.restaurantName.trim())
      newErrors.restaurantName = 'Restaurant name is required';
    if (!formData.branchName.trim())
      newErrors.branchName = 'Branch name is required';
    if (!formData.address.fullAddress.trim())
      newErrors['address.fullAddress'] = 'Full address is required';
    if (!formData.address.coordinates.lat || isNaN(formData.address.coordinates.lat))
      newErrors['coordinates.lat'] = 'Valid latitude is required';
    if (!formData.address.coordinates.lng || isNaN(formData.address.coordinates.lng))
      newErrors['coordinates.lng'] = 'Valid longitude is required';
    if (formData.cuisineType.length === 0)
      newErrors.cuisineType = 'At least one cuisine type is required';

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(
      (day) => {
        const hours = formData.operatingHours[day];
        if (hours.open && !timeRegex.test(hours.open)) {
          newErrors[`operatingHours.${day}.open`] = 'Invalid time format (HH:MM)';
        }
        if (hours.close && !timeRegex.test(hours.close)) {
          newErrors[`operatingHours.${day}.close`] = 'Invalid time format (HH:MM)';
        }
      }
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!restaurant?.restaurantId) {
      Toast({ type: 'error', message: 'Restaurant ID is missing. Please select a valid restaurant.' });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      console.log('Submitting update for restaurantId:', restaurant.restaurantId); // Log restaurantId
      console.log('JWT Token:', token); // Log token for debugging

      const formDataToSend = new FormData();
      formDataToSend.append('restaurantName', formData.restaurantName);
      formDataToSend.append('branchName', formData.branchName);
      formDataToSend.append('address', JSON.stringify(formData.address));
      formDataToSend.append('cuisineType', JSON.stringify(formData.cuisineType));
      formDataToSend.append('operatingHours', JSON.stringify(formData.operatingHours));
      formDataToSend.append('approvalStatus', 'not_approved');

      if (formData.restaurantImage && typeof formData.restaurantImage !== 'string') {
        formDataToSend.append('restaurantImage', formData.restaurantImage);
      }
      if (formData.licenseFile && typeof formData.licenseFile !== 'string') {
        formDataToSend.append('licenseFile', formData.licenseFile);
      }

      console.log('Form data to send:', [...formDataToSend.entries()]); // Log form data

      const response = await api.put(`/api/restaurant/restaurants/${restaurant.restaurantId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Update response:', response.data); // Log successful response
      Toast({ type: 'success', message: 'Restaurant updated successfully' });
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Update Error:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        restaurantId: restaurant.restaurantId,
        fullResponse: err.response?.data,
      });
      let errorMessage = 'Failed to update restaurant';
      if (err.response?.status === 404 && err.response?.data?.message === 'Restaurant not found or unauthorized') {
        errorMessage = 'Restaurant not found or unauthorized';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      Toast({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Edit Restaurant</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Restaurant Name</Form.Label>
                <Form.Control
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  isInvalid={!!errors.restaurantName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.restaurantName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Branch Name</Form.Label>
                <Form.Control
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  isInvalid={!!errors.branchName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.branchName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Full Address</Form.Label>
            <Form.Control
              type="text"
              name="address.fullAddress"
              value={formData.address.fullAddress}
              onChange={handleChange}
              isInvalid={!!errors['address.fullAddress']}
            />
            <Form.Control.Feedback type="invalid">
              {errors['address.fullAddress']}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Latitude</Form.Label>
                <Form.Control
                  type="number"
                  name="coordinates.lat"
                  value={formData.address.coordinates.lat}
                  onChange={handleChange}
                  isInvalid={!!errors['coordinates.lat']}
                />
                <Form.Control.Feedback type="invalid">
                  {errors['coordinates.lat']}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Longitude</Form.Label>
                <Form.Control
                  type="number"
                  name="coordinates.lng"
                  value={formData.address.coordinates.lng}
                  onChange={handleChange}
                  isInvalid={!!errors['coordinates.lng']}
                />
                <Form.Control.Feedback type="invalid">
                  {errors['coordinates.lng']}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Cuisine Type</Form.Label>
            <Form.Select
              multiple
              name="cuisineType"
              value={formData.cuisineType}
              onChange={handleCuisineChange}
              className="cuisine-select"
              isInvalid={!!errors.cuisineType}
            >
              {cuisineOptions.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.cuisineType}
            </Form.Control.Feedback>
          </Form.Group>

          <h5 className="mt-4">Operating Hours</h5>
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
            (day) => (
              <Row key={day} className="mb-3">
                <Col md={2}>
                  <Form.Label className="text-capitalize">{day}</Form.Label>
                </Col>
                <Col md={5}>
                  <InputGroup>
                    <InputGroup.Text>Open</InputGroup.Text>
                    <Form.Control
                      type="text"
                      name={`operatingHours.${day}.open`}
                      value={formData.operatingHours[day].open}
                      onChange={handleChange}
                      placeholder="HH:MM"
                      isInvalid={!!errors[`operatingHours.${day}.open`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`operatingHours.${day}.open`]}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Col>
                <Col md={5}>
                  <InputGroup>
                    <InputGroup.Text>Close</InputGroup.Text>
                    <Form.Control
                      type="text"
                      name={`operatingHours.${day}.close`}
                      value={formData.operatingHours[day].close}
                      onChange={handleChange}
                      placeholder="HH:MM"
                      isInvalid={!!errors[`operatingHours.${day}.close`]}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`operatingHours.${day}.close`]}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Col>
              </Row>
            )
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Restaurant Image</Form.Label>
                <Form.Control
                  type="file"
                  name="restaurantImage"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Restaurant Preview"
                    style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px' }}
                  />
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>License File</Form.Label>
                <Form.Control
                  type="file"
                  name="licenseFile"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
                {previewLicense && (
                  <a
                    href={previewLicense}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', marginTop: '10px' }}
                  >
                    View License
                  </a>
                )}
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={onClose} className="me-2">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Restaurant'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditRestaurantForm;