import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../../../api';
import RestaurantOwnerSidebar from '../../../components/RestaurantOwnerSidebar/RestaurantOwnerSidebar';
import AddOfferModal from './AddOfferFormModal';
import Toast from '../../../utils/toast';
import './OwnerOffersPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

const OwnerOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [ownerID, setOwnerID] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setError] = useState(null);

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
      fetchOffers(ownerID);
    }
  }, [ownerID]);

  const fetchApprovedRestaurants = async (ownerID) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/restaurant/restaurants/owner/${ownerID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const approved = response.data.filter((r) => r.approvalStatus === 'approved');
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

  const fetchOffers = async (ownerID) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/restaurant/offers/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOffers(response.data || []);
    } catch (err) {
      Toast({ type: 'error', message: 'Failed to load offers' });
      console.error(err);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOfferCreated = () => {
    fetchOffers(ownerID);
    setIsModalOpen(false);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDeleteOffer = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await api.delete(`/api/restaurant/offers/${offerId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        Toast({ type: 'success', message: 'Offer deleted successfully' });
        fetchOffers(ownerID);
      } catch (error) {
        Toast({ type: 'error', message: 'Failed to delete offer' });
        console.error(error);
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <RestaurantOwnerSidebar />
      <div className="offer-content" style={{ overflowY: 'auto', height: '100vh' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Manage Offers</h1>

        <div style={{ marginBottom: '20px' }}>
          <button className="icon-button-add-offer" onClick={handleOpenModal} title="Add Offer">
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
            Add Offer
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="offer-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                <th>Restaurants</th>
                <th>Discount</th>
                <th>Valid From</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                    No offers found.
                  </td>
                </tr>
              ) : (
                offers.flatMap((offer, offerIndex) => {
                  // Create a map to filter out duplicate restaurant names
                  const uniqueRestaurants = [];
                  const seenNames = new Set();

                  offer.restaurants?.forEach((r) => {
                    if (!seenNames.has(r.restaurantName)) {
                      seenNames.add(r.restaurantName);
                      uniqueRestaurants.push(r);
                    }
                  });

                  // If no valid restaurants, still show one row with 'Unknown'
                  if (uniqueRestaurants.length === 0) {
                    return [
                      <tr key={`${offer._id}-unknown`}>
                        <td>{offerIndex + 1}</td>
                        <td>{offer.title || `Discount ${offer.discountPercentage}%`}</td>
                        <td>{offer.description || 'No description provided'}</td>
                        <td>Unknown</td>
                        <td>{`${offer.discountPercentage}%`}</td>
                        <td>{formatDateTime(offer.startDate)}</td>
                        <td>{formatDateTime(offer.endDate)}</td>
                        <td>
                          <span
                            className={`status ${
                              offer.status === 'active'
                                ? 'status-active'
                                : offer.status === 'expired'
                                ? 'status-expired'
                                : 'status-inactive'
                            }`}
                          >
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="icon-button-delete-offer"
                            onClick={() => handleDeleteOffer(offer._id)}
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>,
                    ];
                  }

                  return uniqueRestaurants.map((restaurant, idx) => (
                    <tr key={`${offer._id}-${restaurant._id}`}>
                      <td>{offerIndex + 1}</td>
                      <td>{offer.title || `Discount ${offer.discountPercentage}%`}</td>
                      <td>{offer.description || 'No description provided'}</td>
                      <td>{restaurant.restaurantName}</td>
                      <td>{`${offer.discountPercentage}%`}</td>
                      <td>{formatDateTime(offer.startDate)}</td>
                      <td>{formatDateTime(offer.endDate)}</td>
                      <td>
                        <span
                          className={`status ${
                            offer.status === 'active'
                              ? 'status-active'
                              : offer.status === 'expired'
                              ? 'status-expired'
                              : 'status-inactive'
                          }`}
                        >
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="icon-button-delete-offer"
                          onClick={() => handleDeleteOffer(offer._id)}
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ));
                })
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <AddOfferModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onOfferCreated={handleOfferCreated}
            restaurants={restaurants}
            ownerID={ownerID}
          />
        )}
      </div>
    </div>
  );
};

export default OwnerOffersPage;