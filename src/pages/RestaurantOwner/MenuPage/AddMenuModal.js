import React, { useState, useEffect } from 'react';
import api from '../../../api';
import Toast from '../../../utils/toast';
import './AddMenuModal.css';

const AddMenuModal = ({ isOpen, onClose, restaurantName }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [, setRestaurantID] = useState(null);
  const [ownerID, setOwnerID] = useState(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Disable body scroll
    } else {
      document.body.style.overflow = 'auto'; // Re-enable body scroll
    }
    // Cleanup on component unmount or when isOpen changes
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setOwnerID(decoded.userID);
    }
  }, []);

  useEffect(() => {
    if (ownerID && restaurantName) {
      const fetchCategories = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await api.get(`/api/restaurant/categories/owner/${ownerID}/restaurant/${restaurantName}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCategories(res.data);
        } catch (err) {
          console.error(err);
          Toast({ type: 'error', message: 'Failed to fetch categories' });
        }
      };
  
      const fetchRestaurantID = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await api.get(`/api/restaurant/restaurants/owner/${ownerID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const restaurant = res.data.find(r => r.restaurantName === restaurantName);
          if (restaurant) setRestaurantID(restaurant._id);
        } catch (err) {
          console.error(err);
        }
      };
  
      fetchCategories();
      fetchRestaurantID();
    }
  }, [ownerID, restaurantName]);  

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || !imageFile) {
      return Toast({ type: 'error', message: 'Please fill all required fields and select an image' });
    }

    try {
      const token = localStorage.getItem('token');
      const form = new FormData();

      form.append('name', formData.name);
      form.append('description', formData.description);
      form.append('price', parseFloat(formData.price));
      form.append('category', formData.category);
      form.append('owner', ownerID);
      form.append('restaurantName', restaurantName);
      form.append('image', imageFile);

      await api.post('/api/restaurant/menu', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Toast({ type: 'success', message: 'Menu item added successfully!' });
      onClose();
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
      });
      setImageFile(null);
    } catch (err) {
      console.error(err);
      Toast({ type: 'error', message: 'Failed to add menu item' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="menu-modal-backdrop">
      <div className="menu-modal-container">
        <button className="menu-modal-close-btn" onClick={onClose}>&times;</button>
        <h3>Add Menu Item to {restaurantName}</h3>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label>Item Name</label>
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

          <label>Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            required
          />

          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <label>Menu Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />

          <div className="menu-modal-actions">
            <button type="submit" className="confirm-btn">Add</button>
            <button type="button" className="dismiss-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMenuModal;