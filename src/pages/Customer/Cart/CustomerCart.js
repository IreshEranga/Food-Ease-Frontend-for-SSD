import React, { useEffect, useState } from 'react';
import CustomerBottomNavbar from '../../../components/CustomerBottomNavbar/CustomerBottomNavbar';
import CustomerSideBar from '../../../components/CustomerSideBar/CustomerSideBar';
import { useMediaQuery } from 'react-responsive';
import { useCart } from '../../../context/CartContext';
import { Button, Card, Row, Col, Container } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import DeliveryLocationButton from '../../../components/DeliveryLocation/DeliveryLocation';

function CustomerCart() {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const navigate = useNavigate();
  const { cart, updateCartQuantity, removeItemFromCart } = useCart();
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
      setRestaurantOffers({}); // Clear offers if cart is empty
    }
  }, [cart]);

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
      restaurantName: cart.find(item => item.restaurantId === restaurantId)?.restaurantName || 'Unknown',
      subtotal,
      discountPercentage,
      discountAmount,
      discountedSubtotal: subtotal - discountAmount,
      offerTitle: offer ? (offer.title || `${discountPercentage}% Off`) : null,
    };
  });

  // Calculate total price and discounts
  const totalPrice = discountDetails.reduce((sum, detail) => sum + detail.subtotal, 0);
  const totalDiscountAmount = discountDetails.reduce((sum, detail) => sum + detail.discountAmount, 0);
  const finalPrice = totalPrice - totalDiscountAmount;

  const handleQtyChange = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty > 0) {
      updateCartQuantity(item._id, newQty);
    }
  };

  const handleCheckout = () => {
    const globalCart = cart.map(item => ({
      _id: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      branchName: item.branchName,
      address: item.address || "No Address",
    }));
  
    sessionStorage.setItem("globalCart", JSON.stringify(globalCart));
    sessionStorage.setItem("finalPrice", JSON.stringify(finalPrice)); 
    sessionStorage.setItem("totalDiscount", JSON.stringify(totalDiscountAmount)); 

    navigate('/order-summary', {
      state: { totalPrice, discountDetails, finalPrice, restaurantOffers }
    });
  };  

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isDesktop && <CustomerSideBar />}
      
      <div
        style={{
          flex: 1,
          backgroundColor: '#FFF8F8',
          padding: '20px',
          overflowY: isDesktop ? 'unset' : 'auto', 
          maxHeight: isDesktop ? 'unset' : 'calc(100vh - 60px)', 
        }}
      >
        <h3 className="mb-4">🛒 Your Cart</h3>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <Container>
            <Row xs={1} md={2} lg={2} className="g-3">
              {cart.map(item => (
                <Col key={item._id}>
                  <Card className="h-100 shadow-sm position-relative">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-2"
                      onClick={() => removeItemFromCart(item._id)}
                    >
                      <FaTrash />
                    </Button>
                    <Row className="g-0 align-items-center">
                      <Col xs={4}>
                        <div style={{ width: '100px', height: '100px', overflow: 'hidden', margin: '10px auto' }}>
                          <img
                            src={item.image || 'https://via.placeholder.com/100'}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                          />
                        </div>
                      </Col>
                      <Col xs={8}>
                        <Card.Body>
                          <Card.Title>{item.name}</Card.Title>
                          <Card.Subtitle className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                            {item.restaurantName} ({item.branchName})
                          </Card.Subtitle>
                          <div className="d-flex align-items-center mb-2">
                            <Button variant="light" size="sm" onClick={() => handleQtyChange(item, -1)}>
                              <FaMinus />
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button variant="light" size="sm" onClick={() => handleQtyChange(item, 1)}>
                              <FaPlus />
                            </Button>
                          </div>
                          <div className="d-flex justify-content-between small">
                            <span>Price: Rs. {item.price}</span>
                            <strong>Total: Rs. {item.price * item.quantity}</strong>
                          </div>
                        </Card.Body>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="text-end mt-4">
              <h5 style={{fontSize: window.innerWidth < 768 ? '0.9rem' : '1.25rem',}}>Subtotal: Rs. {totalPrice.toFixed(2)}</h5>
              {discountDetails.map(detail => (
                detail.offerTitle && (
                <h5
                  key={detail.restaurantId}
                  style={{
                    color: '#B22222',
                    fontSize: window.innerWidth < 768 ? '0.8rem' : '1.25rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                Offer for {detail.restaurantName}: {detail.offerTitle} (-Rs. {detail.discountAmount.toFixed(2)})
              </h5>

                )
              ))}
              {totalDiscountAmount > 0 && (
                <h5 style={{ color: '#28a745', fontSize: window.innerWidth < 768 ? '0.9rem' : '1.25rem',}}>
                  Total Discount: Rs. {totalDiscountAmount.toFixed(2)}
                </h5>
              )}
              <h5 style={{fontSize: window.innerWidth < 768 ? '0.9rem' : '1.25rem',}}>Final Price: Rs. {finalPrice.toFixed(2)}</h5>
              <Button
                variant="success"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Proceed to Checkout
              </Button>
            </div>
          </Container>
        )}
      </div>
      {!isDesktop && <CustomerBottomNavbar />}
      <DeliveryLocationButton />
    </div>
  );
}

export default CustomerCart;