import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../api';
import CustomerBottomNavbar from '../../../components/CustomerBottomNavbar/CustomerBottomNavbar';
import CustomerSideBar from '../../../components/CustomerSideBar/CustomerSideBar';
import { useMediaQuery } from 'react-responsive';
import { Container, Row, Col, Card, Image, Badge, Modal, Button } from 'react-bootstrap';
import RestaurantMenu from '../../../components/Menu/RestaurantMenu';

function CustomerRestaurantView() {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const { id } = useParams();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState(location.state?.restaurant || null);
  const [activeOffer, setActiveOffer] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false); // State for modal visibility

  useEffect(() => {
    if (!restaurant) {
      api.get(`/api/restaurant/restaurants/${id}`)
        .then(res => setRestaurant(res.data))
        .catch(err => console.error(err));
    }
  }, [id, restaurant]);

  useEffect(() => {
    // Fetch active offers for the specific restaurant
    api.get(`/api/restaurant/offers/restaurant/${id}`)
      .then(res => {
        const offers = res.data || [];
        // Find an active offer that includes this restaurant
        const active = offers.find(offer => 
          offer.restaurants.some(restaurant => restaurant._id === id) && 
          offer.status === 'active'
        );
        setActiveOffer(active);
      })
      .catch(err => console.error(err));
  }, [id]);

  // Handlers for modal
  const handleShowOffer = () => setShowOfferModal(true);
  const handleCloseOffer = () => setShowOfferModal(false);

  if (!restaurant) return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FFF8F8' }}>
      <div style={{ flex: 1 }}>
        {isDesktop && <CustomerSideBar />}
        <p className="text-center mt-5">Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FFF8F8' }}>
      {isDesktop && <CustomerSideBar />}

      <div style={{ flex: 1 }}>
        <Container className="py-4">
          <Card className="shadow-sm rounded-4 border-0 mb-4">
            <Row className="g-0">
              <Col md={5}>
                <Image 
                  src={restaurant.restaurantImage} 
                  alt="Restaurant"
                  fluid 
                  className="rounded-start-4"
                  style={{ height: '100%', objectFit: 'cover' }}
                />
              </Col>
              <Col md={7} className="position-relative">
                <Card.Body className="p-4">
                  <h2 className="fw-bold mb-3">{restaurant.restaurantName}</h2>
                  <h5 className="text-muted mb-3">{restaurant.branchName}</h5>
                  <p><strong>📍 Address:</strong> {restaurant.address.fullAddress}</p>
                  <p><strong>🌍 Coordinates:</strong> {restaurant.address.coordinates.lat}, {restaurant.address.coordinates.lng}</p>
                  {activeOffer && (
                    <div 
                      className="position-absolute mt-3 me-3 animate__animated animate__bounceIn"
                      onClick={handleShowOffer}
                      style={{ 
                        top: isDesktop ? '0' : 'auto',
                        bottom: isDesktop ? 'auto' : '0',
                        right: '0',
                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                        borderRadius: '25px',
                        padding: isDesktop ? '10px 20px' : '8px 15px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        zIndex: 1,
                        maxWidth: isDesktop ? '300px' : '200px',
                        cursor: 'pointer',
                      }}
                    >
                      <Badge
                        bg="transparent"
                        text="dark"
                        className="p-0"
                        style={{
                          fontSize: isDesktop ? '1.2rem' : '0.9rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          whiteSpace: 'normal',
                          textAlign: 'center',
                          display: 'block',
                        }}
                      >
                        🎉 {activeOffer.title || `Save ${activeOffer.discountValue}%!`}
                      </Badge>
                      <div 
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          width: isDesktop ? '15px' : '10px',
                          height: isDesktop ? '15px' : '10px',
                          background: '#FF4500',
                          borderRadius: '50%',
                          animation: 'sparkle 1.5s infinite',
                        }}
                      />
                      <style>
                        {`
                          @keyframes sparkle {
                            0% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(1.5); opacity: 0.7; }
                            100% { transform: scale(1); opacity: 1; }
                          }
                        `}
                      </style>
                    </div>
                  )}
                </Card.Body>
              </Col>
            </Row>
          </Card>

          {/* Restaurant Menu Section */}
          <Card className="shadow-sm rounded-4 border-0">
            <Card.Body className="p-4">
              <h4 className="fw-semibold mb-3">🍽️ Restaurant Menu</h4>
              <RestaurantMenu restaurantId={restaurant._id} />
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Offer Modal */}
      {activeOffer && (
        <Modal 
          show={showOfferModal} 
          onHide={handleCloseOffer} 
          centered
          size="md"
          className="offer-modal"
        >
          <Modal.Header 
            closeButton 
            style={{ 
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              border: 'none',
              borderRadius: '15px 15px 0 0',
            }}
          >
            <Modal.Title 
              className="w-100 text-center"
              style={{ 
                color: '#000',
                fontWeight: 'bold',
                fontSize: isDesktop ? '1.5rem' : '1.2rem',
              }}
            >
              🎉 Special Offer
            </Modal.Title>
          </Modal.Header>
          <Modal.Body 
            className="p-4"
            style={{ 
              backgroundColor: '#FFF8F8',
              borderRadius: '0 0 15px 15px',
            }}
          >
            <h4 className="mb-3" style={{ fontSize: isDesktop ? '1.3rem' : '1.1rem', fontWeight: 'bold' }}>
              {activeOffer.title || `Save ${activeOffer.discountValue}%!`}
            </h4>
            <p className="mb-2" style={{ fontSize: isDesktop ? '1rem' : '0.9rem' }}>
              <strong>Discount:</strong> {activeOffer.discountValue}% off your order
            </p>
            {activeOffer.description && (
              <p className="mb-2" style={{ fontSize: isDesktop ? '1rem' : '0.9rem' }}>
                <strong>Details:</strong> {activeOffer.description}
              </p>
            )}
            {activeOffer.endDate && (
              <p className="mb-2" style={{ fontSize: isDesktop ? '1rem' : '0.9rem' }}>
                <strong>Valid Until:</strong> {new Date(activeOffer.endDate).toLocaleDateString()}
              </p>
            )}
            {activeOffer.terms && (
              <p className="mb-2" style={{ fontSize: isDesktop ? '0.9rem' : '0.8rem', color: '#666' }}>
                <strong>Terms:</strong> {activeOffer.terms}
              </p>
            )}
          </Modal.Body>
          <Modal.Footer 
            style={{ 
              border: 'none',
              backgroundColor: '#FFF8F8',
              borderRadius: '0 0 15px 15px',
            }}
          >
            <Button 
              variant="primary" 
              onClick={handleCloseOffer}
              style={{
                backgroundColor: '#FF4500',
                border: 'none',
                borderRadius: '25px',
                padding: isDesktop ? '10px 30px' : '8px 20px',
                fontWeight: 'bold',
                fontSize: isDesktop ? '1rem' : '0.9rem',
              }}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {!isDesktop && <CustomerBottomNavbar />}
    </div>
  );
}

export default CustomerRestaurantView;