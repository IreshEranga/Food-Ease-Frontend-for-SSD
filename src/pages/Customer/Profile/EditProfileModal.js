import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import api from '../../../api';
import { useAuthStore } from '../../../store/useAuthStore';

const EditProfileModal = ({ customerData, onClose, onUpdate }) => {
  const [error, setError] = useState('');

  const token = useAuthStore((state) => state.token);
  const [formData, setFormData] = useState({
    name: customerData?.name || '',
    email: customerData?.email || '',
    mobileNumber: customerData?.mobileNumber || '',
    address: customerData?.address || '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/api/users/customers/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate(res.data.data);
      onClose();
    } catch (err) {
        console.error('Profile update failed', err);
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }      
  };

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>Edit Profile</h3>
          <FaTimes onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          {['name', 'email', 'mobileNumber', 'address'].map((field) => (
            <div key={field} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                style={inputStyle}
                disabled={field === 'email'}
                />
            </div>
          ))}
          <button type="submit" style={buttonStyle}>Save Changes</button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
};

const overlayStyles = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000,
};

const modalStyles = {
  background: 'white',
  padding: '30px',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '500px',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  marginTop: '10px',
  backgroundColor: '#27ae60',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  cursor: 'pointer',
};

export default EditProfileModal;