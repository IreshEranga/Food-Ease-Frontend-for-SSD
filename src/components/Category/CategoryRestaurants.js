import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import { useMediaQuery } from 'react-responsive';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';
import { Button } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import CartSummary from '../Cart/CartSummary';
import CustomerBottomNavbar from '../CustomerBottomNavbar/CustomerBottomNavbar';
import CustomerSideBar from '../CustomerSideBar/CustomerSideBar';
import './CategoryRestaurants.css';

const CategoryRestaurants = () => {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const { categoryName } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const token = useAuthStore((state) => state.token);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get(`/api/restaurant/categories/getRestaurantsByCategory/${categoryName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurants(response.data.restaurants);
        // Initialize quantities for each menu item
        const initialQuantities = {};
        response.data.restaurants.forEach((restaurant) => {
          restaurant.menu.forEach((item) => {
            initialQuantities[`${restaurant._id}-${item.name}`] = 1;
          });
        });
        setQuantities(initialQuantities);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch restaurants');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [categoryName, token]);

  const handleQuantityChange = (itemKey, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [itemKey]: Math.max(1, (prev[itemKey] || 1) + delta),
    }));
  };

  const handleAddToCart = (restaurant, item) => {
    const itemKey = `${restaurant._id}-${item.name}`;
    const quantity = quantities[itemKey] || 1;
    addToCart({
      _id: `${restaurant._id}-${item.name}`,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurantId: restaurant._id,
      restaurantName: restaurant.restaurantName,
      branchName: restaurant.branchName,
    }, quantity);
    // Optionally reset quantity
    setQuantities((prev) => ({
      ...prev,
      [itemKey]: 1,
    }));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isDesktop && <CustomerSideBar />}
      <div style={{ flex: 1, backgroundColor: '#FFF8F8', padding: '20px', position: 'relative' }}>

    <div className="page-container">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="page-title"
      >
        {categoryName} Restaurants
      </motion.h2>

      {restaurants.length === 0 ? (
        <p className="no-results">No restaurants found for this category.</p>
      ) : (
        <div className="restaurants-grid">
          {restaurants.map((restaurant) => (
            <div key={restaurant._id} className="restaurant-card">
              <img
                src={restaurant.restaurantImage}
                alt={restaurant.restaurantName}
                className="restaurant-image"
              />
              <div className="restaurant-details">
                <h3 className="restaurant-name">{restaurant.restaurantName} - {restaurant.branchName}</h3>
                <p className="restaurant-address">{restaurant.address.fullAddress}</p>
              </div>
              <hr className="separator" />
              {restaurant.menu.length > 0 ? (
                <div className="menu-grid">
                  {restaurant.menu.map((item) => {
                    const itemKey = `${restaurant._id}-${item.name}`;
                    return (
                      <div key={item.name} className="menu-card">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="menu-image"
                        />
                        <div className="menu-details">
                          <h5 className="menu-name">{item.name}</h5>
                          <p className="menu-description">{item.description}</p>
                          <p className="menu-price">LKR {item.price}</p>
                          <span className={item.available ? 'menu-available' : 'menu-unavailable'}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        {item.available && (
                          <div className="quantity-add-cart">
                            <div className="quantity-selector">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleQuantityChange(itemKey, -1)}
                              >
                                -
                              </Button>
                              <span className="quantity-display">{quantities[itemKey] || 1}</span>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleQuantityChange(itemKey, 1)}
                              >
                                +
                              </Button>
                            </div>
                            <center>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAddToCart(restaurant, item)}
                              className="add-to-cart-btn"
                              style={{padding:'10px'}}
                            >
                              Add to Cart
                            </Button>
                            </center>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-menu">No menu items available.</p>
              )}
            </div>
          ))}
        </div>
      )}
      <CartSummary/>
    </div>

    </div>
    {!isDesktop && <CustomerBottomNavbar />}
    </div>
  );
};

export default CategoryRestaurants;