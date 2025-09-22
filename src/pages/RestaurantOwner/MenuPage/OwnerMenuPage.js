import React, { useState, useEffect, useCallback } from 'react'; 
import { jwtDecode } from 'jwt-decode';
import api from '../../../api';
import RestaurantOwnerSidebar from '../../../components/RestaurantOwnerSidebar/RestaurantOwnerSidebar';
import RestaurantMenu from './RestaurantMenu';
import AddCategoryForm from './AddCategoryForm';
import AddMenuModal from './AddMenuModal';
import Toast from '../../../utils/toast';
import './OwnerMenuPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faClipboardList, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const OwnerMenuPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ownerID, setOwnerID] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [, setError] = useState(null);
  const [displayMenuRestaurantID, setDisplayMenuRestaurantID] = useState(null);
  const [restaurantCounts, setRestaurantCounts] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.roleID === 'role2') {
          setOwnerID(decoded.userID);
        } else {
          setError('Unauthorized access: Not a Restaurant Owner');
        }
      } catch (err) {
        setError('Invalid token. Please log in again.');
      }
    } else {
      setError('No authentication token found.');
    }
  }, []);

  useEffect(() => {
    if (ownerID) {
      fetchApprovedRestaurants(ownerID);
    }
  }, [ownerID]);

  const fetchApprovedRestaurants = async (ownerID) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/restaurant/restaurants/owner/${ownerID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const approved = response.data.filter(r => r.approvalStatus === 'approved');
      const uniqueRestaurantsMap = {};
      approved.forEach((r) => {
        if (!uniqueRestaurantsMap[r.restaurantName]) {
          uniqueRestaurantsMap[r.restaurantName] = r;
        }
      });
      setRestaurants(Object.values(uniqueRestaurantsMap));
    } catch (err) {
      Toast({ type: 'error', message: 'Failed to load restaurants' });
    }
  };

  const fetchRestaurantCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const counts = {};
      await Promise.all(
        restaurants.map(async (restaurant) => {
          const response = await api.get(`/api/restaurant/restaurants/name/count?restaurantName=${encodeURIComponent(restaurant.restaurantName)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          counts[restaurant.restaurantName] = response.data.count;
        })
      );
      setRestaurantCounts(counts);
    } catch (err) {
      Toast({ type: 'error', message: 'Failed to load restaurant counts' });
    }
  }, [restaurants]);

  useEffect(() => {
    if (restaurants.length > 0) {
      fetchRestaurantCounts();
    }
  }, [restaurants, fetchRestaurantCounts]);

  const handleAddMenu = (restaurantName) => {
    setSelectedRestaurant(restaurantName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRestaurant(null);
    setIsModalOpen(false);
  };

  const handleOpenCategoryModal = () => setIsCategoryModalOpen(true);
  const handleCloseCategoryModal = () => setIsCategoryModalOpen(false);

  const toggleDisplayMenuBelow = (restaurantID) => {
    setDisplayMenuRestaurantID(prevID => prevID === restaurantID ? null : restaurantID);
  };  

  const handleCloseMenu = () => {
    setDisplayMenuRestaurantID(null);
  };

  return (
    <div className="owner-menu-wrapper">
      <RestaurantOwnerSidebar />
      <div className="menu-main-section">
        <h1 style={{textAlign:'center', marginBottom:'30px'}}>Menu Items for Restaurants</h1>

        <div style={{ marginBottom: '20px' }}>
          <button className="action-btn-add" onClick={handleOpenCategoryModal} title="Add Category">
            <FontAwesomeIcon icon={faPlusSquare} style={{ marginRight: '8px' }} />
            Add Category
          </button>
        </div>

        <div className="table-container">
          <table className="menu-data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Restaurant Name</th>
                <th>Restaurant Count</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
             {restaurants.map((restaurant, index) => (
                <React.Fragment key={restaurant._id}>
                  <tr>
                    <td>{index + 1}</td>
                    <td>{restaurant.restaurantName}</td>
                    <td>{restaurantCounts[restaurant.restaurantName] || 'Loading...'}</td>
                    <td className="action-controls">
                      <button className="action-btn-menu-add" onClick={() => handleAddMenu(restaurant.restaurantName)} title="Add Menu">
                        <FontAwesomeIcon icon={faPlusSquare} />
                      </button>
                      <button
                        className="action-btn-menu-view"
                        onClick={() => toggleDisplayMenuBelow(restaurant._id)}
                        title={displayMenuRestaurantID === restaurant._id ? 'Hide Menu' : 'Show Menu'}
                      >
                        <FontAwesomeIcon icon={displayMenuRestaurantID === restaurant._id ? faTimesCircle : faClipboardList} />
                      </button>
                    </td>
                  </tr>
                  {displayMenuRestaurantID === restaurant._id && (
                    <tr>
                      <td colSpan="4">
                        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                          <RestaurantMenu 
                            restaurantID={restaurant._id} 
                            restaurantName={restaurant.restaurantName}
                            onClose={handleCloseMenu} 
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <AddMenuModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          restaurantName={selectedRestaurant}
        />

        {displayMenuRestaurantID && (
          <RestaurantMenu
            restaurantID={displayMenuRestaurantID}
            restaurantName={restaurants.find(r => r._id === displayMenuRestaurantID)?.restaurantName || 'Unknown Restaurant'}
            onClose={handleCloseMenu}
          />
        )}

        {isCategoryModalOpen && (
          <AddCategoryForm
            ownerID={ownerID}
            restaurants={restaurants}
            onClose={handleCloseCategoryModal}
          />
        )}
      </div>
    </div>
  );
};

export default OwnerMenuPage;