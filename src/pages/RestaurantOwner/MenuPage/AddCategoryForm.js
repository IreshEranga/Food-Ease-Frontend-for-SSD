import React, { useState } from 'react';
import api from '../../../api';
import Toast from '../../../utils/toast';
import './AddCategoryForm.css';

const AddCategoryForm = ({ ownerID, restaurants, onClose }) => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    name: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.restaurantName || !formData.name) {
      return Toast({ type: 'error', message: 'Please fill all required fields' });
    }

    try {
      const token = localStorage.getItem('token');
      await api.post(
        `/api/restaurant/categories/add/${formData.restaurantName}`,
        {
          name: formData.name,
          description: formData.description,
          ownerId: ownerID,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Toast({ type: 'success', message: 'Category added successfully!' });
      onClose();
    } catch (err) {
      console.error(err);
      Toast({ type: 'error', message: err.response?.data?.message || 'Failed to add category' });
    }
  };

  return (
    <div className="category-modal-overlay">
      <div className="category-modal">
        <h3>Add Category</h3>
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

          <label>Category Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <div className="category-modal-buttons">
            <button type="submit" className="submit-btn">Add</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryForm;