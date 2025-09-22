import React, { useEffect, useState } from 'react';
import RiderSidebar from '../../components/RiderSidebar/RiderSidebar';
import { FaUserCircle } from 'react-icons/fa'; // Profile icon
import Modal from 'react-modal';
Modal.setAppElement('#root');
// Helper to decode JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

const DriverProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    vehicleNumber: '',
    status: '',
    isAvailable: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return;
    }

    const decoded = parseJwt(token);
    console.log('Decoded token:', decoded);

    fetch(`${process.env.REACT_APP_BACKEND_API}/api/users/deliveryrider/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('Profile data received:', data);
        setProfile(data.data);  // Update this to access `data.data`
        setEditedProfile(data.data); // Initialize edited profile
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err);
      });
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_BACKEND_API}/api/users/deliveryrider/rupdate/${profile._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedProfile),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Profile updated:', data);
        setProfile(data.data); // Update profile state after edit
        closeModal();
      })
      .catch(err => {
        console.error('Failed to update profile:', err);
      });
  };

  const handleDelete = () => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_BACKEND_API}/api/users/deliveryrider/rdelete/${profile._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('Profile deleted:', data);
        // Redirect to another page or handle post-delete logic
      })
      .catch(err => {
        console.error('Failed to delete profile:', err);
      });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      backgroundColor: '#fff',
      minHeight: '100vh',
      padding: '20px',
    }}>
      <RiderSidebar />
      <div style={{
        flex: 1,
        marginLeft: '20px',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        width: '60%',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <FaUserCircle size={100} color="#ff6f00" />
        </div>
        <h2 style={{ color: '#ff6f00', fontSize: '2rem', marginBottom: '20px' }}>Driver Profile</h2>
        {profile ? (
          <>
            <ul style={{ listStyleType: 'none', padding: '0', fontSize: '1.2rem' }}>
              <li style={{ margin: '10px 0' }}><strong style={{ color: '#ff6f00' }}>Name:</strong> {profile.name || 'N/A'}</li>
              <li style={{ margin: '10px 0' }}><strong style={{ color: '#ff6f00' }}>Mobile Number:</strong> {profile.mobileNumber || 'N/A'}</li>
              <li style={{ margin: '10px 0' }}><strong style={{ color: '#ff6f00' }}>Email:</strong> {profile.email || 'N/A'}</li>
              <li style={{ margin: '10px 0' }}><strong style={{ color: '#ff6f00' }}>Vehicle Number:</strong> {profile.vehicleNumber || 'N/A'}</li>
              <li style={{ margin: '10px 0' }}><strong style={{ color: '#ff6f00' }}>Status:</strong> {profile.status || 'N/A'}</li>
              <li style={{ margin: '10px 0' }}><strong style={{ color: '#ff6f00' }}>Available:</strong> {profile.isAvailable ? 'Yes' : 'No'}</li>
            </ul>
            <button
              style={{ margin: '10px', padding: '10px 20px', backgroundColor: '#ff6f00', color: 'white', border: 'none', borderRadius: '5px' }}
              onClick={openModal}
            >
              Edit Profile
            </button>
            <button
              style={{ margin: '10px', padding: '10px 20px', backgroundColor: '#ff6f00', color: 'white', border: 'none', borderRadius: '5px' }}
              onClick={handleDelete}
            >
              Delete Profile
            </button>
          </>
        ) : (
          <p style={{ color: '#ff6f00', fontSize: '1.5rem' }}>Loading profile...</p>
        )}

        {/* Modal for Edit */}
        <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '20px',
          }
        }}>
          <h3>Edit Profile</h3>
          <form onSubmit={handleEditSubmit}>
            <div>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={editedProfile.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Mobile Number</label>
              <input
                type="text"
                name="mobileNumber"
                value={editedProfile.mobileNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editedProfile.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Vehicle Number</label>
              <input
                type="text"
                name="vehicleNumber"
                value={editedProfile.vehicleNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Status</label>
              <input
                type="text"
                name="status"
                value={editedProfile.status}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label>Available</label>
              <input
                type="checkbox"
                name="isAvailable"
                checked={editedProfile.isAvailable}
                onChange={(e) => setEditedProfile({ ...editedProfile, isAvailable: e.target.checked })}
              />
            </div>
            <button type="submit" style={{ backgroundColor: '#ff6f00', color: 'white', border: 'none', padding: '10px 20px', marginTop: '10px' }}>
              Save Changes
            </button>
          </form>
          <button onClick={closeModal} style={{ marginTop: '10px', padding: '10px', backgroundColor: '#ddd', borderRadius: '5px' }}>Cancel</button>
        </Modal>
      </div>
    </div>
  );
};

export default DriverProfile;
