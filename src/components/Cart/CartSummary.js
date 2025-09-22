import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import api from '../../api';

export default function CartSummary() {
  const { cart } = useCart();    
  const [visible, setVisible] = useState(true);
  const [restaurantOffers, setRestaurantOffers] = useState({});

  // Fetch active offers for each unique restaurant in the cart
  useEffect(() => {
    if (cart.length > 0) {
      // Get unique restaurant IDs
      const restaurantIds = [...new Set(cart.map(item => item.restaurantId))];

      // Fetch offers for each restaurant
      const fetchOffers = async () => {
        const offersByRestaurant = {};
        for (const restaurantId of restaurantIds) {
          try {
            const res = await api.get(`/api/restaurant/offers/restaurant/${restaurantId}`);
            const offers = res.data || [];
            const activeOffer = offers.find(offer =>
              offer.restaurants.some(restaurant => restaurant._id === restaurantId) &&
              offer.status === 'active'
            );
            offersByRestaurant[restaurantId] = activeOffer || null;
          } catch (err) {
            console.error(`Error fetching offer for restaurant ${restaurantId}:`, err);
            offersByRestaurant[restaurantId] = null;
          }
        }
        setRestaurantOffers(offersByRestaurant);
      };

      fetchOffers();
    } else {
      setRestaurantOffers({});
    }
  }, [cart]);

  if (!visible || cart.length === 0) return null;

  const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.quantity * i.price, 0);

  // Calculate subtotals and discounts per restaurant
  const restaurantSubtotals = cart.reduce((acc, item) => {
    const subtotal = (acc[item.restaurantId] || 0) + item.price * item.quantity;
    return { ...acc, [item.restaurantId]: subtotal };
  }, {});

  const discountDetails = Object.keys(restaurantSubtotals).map(restaurantId => {
    const offer = restaurantOffers[restaurantId];
    const subtotal = restaurantSubtotals[restaurantId] || 0;
    const discountPercentage = offer ? offer.discountValue : 0;
    const discountAmount = subtotal * (discountPercentage / 100);
    return {
      restaurantId,
      subtotal,
      discountAmount,
      discountedSubtotal: subtotal - discountAmount,
    };
  });

  const totalDiscountAmount = discountDetails.reduce((sum, detail) => sum + detail.discountAmount, 0);
  const finalPrice = totalPrice - totalDiscountAmount;

  return (
    <motion.div
      className="position-fixed shadow-lg bg-white rounded p-3"
      style={{ bottom: 20, right: 20, zIndex: 9999, width: 280 }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="d-flex justify-content-end">
        <Button variant="light" size="sm" onClick={() => setVisible(false)}>×</Button>
      </div>
      <h6>🛒 Cart Summary</h6>
      <ul className="list-unstyled small">
        {cart.map(item => (
          <li key={item._id} className="mb-2">
            {item.name} × {item.quantity} = Rs. {item.quantity * item.price}
            <div className="text-muted small">
              {item.restaurantName} ({item.branchName})
            </div>
          </li>
        ))}
      </ul>
      <hr />
      <div className="small">
        <div className="d-flex justify-content-between">
          <strong>Subtotal:</strong> <span>Rs. {totalPrice.toFixed(2)}</span>
        </div>
        {totalDiscountAmount > 0 && (
          <div className="d-flex justify-content-between" style={{ color: '#28a745' }}>
            <strong>Total Discount:</strong> <span>Rs. {totalDiscountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="d-flex justify-content-between">
          <strong>Final Price:</strong> <strong>Rs. {finalPrice.toFixed(2)}</strong>
        </div>
      </div>
      <div className="text-end mt-2">
        <Button size="sm" href="/customer/cart">View Cart ({totalQty})</Button>
      </div>
    </motion.div>
  );
}