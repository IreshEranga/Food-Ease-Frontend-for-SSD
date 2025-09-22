import React, { useState, useEffect } from 'react';
import api from '../../../api';
import Toast from '../../../utils/toast';
import './AddOfferFormModal.css';

const AddOfferFormModal = ({ isOpen, onClose, onOfferCreated, restaurants, ownerID }) => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    title: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.restaurantName ||
      !formData.title ||
      !formData.discountPercentage ||
      !formData.startDate ||
      !formData.endDate
    ) {
      return Toast({ type: 'error', message: 'Please fill all required fields' });
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        discountPercentage: parseFloat(formData.discountPercentage),
        restaurantName: formData.restaurantName,
      };

      await api.post('/api/restaurant/offers/add', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Toast({ type: 'success', message: 'Offer added successfully!' });
      onOfferCreated();
      setFormData({
        restaurantName: '',
        title: '',
        discountPercentage: '',
        startDate: '',
        endDate: '',
        description: '',
      });
    } catch (err) {
      console.error(err);
      Toast({
        type: 'error',
        message: err.response?.data?.message || 'Failed to add offer',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="offer-modal-backdrop">
      <div className="offer-modal-container">
        <button className="offer-modal-close-btn" onClick={onClose}>×</button>
        <h3>Add Offer</h3>
        <form onSubmit={handleSubmit}>
          <label>Restaurant</label>
          <select
            name="restaurantName"
            value={formData.restaurantName}
            onChange={handleChange}
            required
          >
            <option value="">Select Restaurant</option>
            {restaurants.map((r, i) => (
              <option key={i} value={r.restaurantName}>
                {r.restaurantName}
              </option>
            ))}
          </select>

          <label>Offer Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Discount Percentage (%)</label>
          <input
            type="number"
            name="discountPercentage"
            value={formData.discountPercentage}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.01"
            required
          />

          <label>Start Date</label>
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          <label>End Date</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <div className="offer-modal-actions">
            <button type="submit" className="confirm-btn">Add Offer</button>
            <button type="button" className="dismiss-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOfferFormModal;