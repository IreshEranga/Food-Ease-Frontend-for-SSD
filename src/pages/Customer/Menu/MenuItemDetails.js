import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Container, Button, Row, Col, Form, Image } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import CustomerSideBar from '../../../components/CustomerSideBar/CustomerSideBar';
import CustomerBottomNavbar from '../../../components/CustomerBottomNavbar/CustomerBottomNavbar';
import { useCart } from '../../../context/CartContext';
import Toast from '../../../utils/toast';
import CartSummary from '../../../components/Cart/CartSummary';
import DeliveryLocationButton from '../../../components/DeliveryLocation/DeliveryLocation';

function MenuItemDetails() {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const { state } = useLocation();
  const item = state?.item;
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  

  useEffect(() => {
    if (item?.restaurants) {
      setBranches(item.restaurants);
      // default select first branch
      if (item.restaurants.length === 1) {
        setSelectedBranchId(item.restaurants[0]._id);
      }
    }
  }, [item]);

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    if (branches.length > 1 && !selectedBranchId) {
      alert('Please select a branch');
      return;
    }

    const branch = branches.find(b => b._id === selectedBranchId) || branches[0];
    const cartItem = {
      _id: item._id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity,
      restaurantId: branch._id,
      restaurantName: branch.restaurantName,
      branchName: branch.branchName,
      restaurantImage: branch.restaurantImage,
      address: branch.address?.fullAddress || '',
      coordinates: branch.address?.coordinates || {},
    };

    addToCart(cartItem);
    Toast({ type: 'success', message: 'Item added to cart successfully!' });
    navigate('/customer/cart');
  };

  if (!item) return <p>No item data found.</p>;

  const branch = branches.find(b => b._id === selectedBranchId) || branches[0];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isDesktop && <CustomerSideBar />}
      <div style={{ flex: 1, backgroundColor: '#FFF8F8', padding: 20 }}>
        
        <Container className="my-4">
          <Card className="shadow-lg">
            <Row className="g-0">
              <Col md={6} className="d-flex justify-content-center align-items-center">
                <Image
                  src={item.image}
                  rounded
                  style={{
                    height: 250,
                    width: 250,
                    objectFit: 'cover',
                    borderRadius: '20px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                />
              </Col>
              <Col md={6}>
                <Card.Body>
                  <Card.Title className="mb-3">{item.name}</Card.Title>

                  <div className="d-flex align-items-center mb-3">
                    <Image
                      src={branch?.restaurantImage || 'https://via.placeholder.com/60'}
                      roundedCircle
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        border: '2px solid #ccc',
                        marginRight: 15,
                      }}
                    />
                    <div>
                      <h6 className="mb-0">{branch?.restaurantName}</h6>
                      <small className="text-muted">{branch?.branchName}</small>
                    </div>
                  </div>

                  <Card.Text>
                    <strong>Price:</strong> Rs.{item.price.toFixed(2)}<br/>
                    <strong>Description:</strong> {item.description || 'No description.'}
                  </Card.Text>

                  <div className="d-flex align-items-center gap-2 my-3">
                    <Button variant="outline-danger" size="sm" onClick={decrement}>-</Button>
                    <span className="fw-bold">{quantity}</span>
                    <Button variant="outline-success" size="sm" onClick={increment}>+</Button>
                  </div>

                  {branches.length > 1 && (
                    <Form.Group className="mb-3">
                      <Form.Label>Select Branch</Form.Label>
                      <Form.Control
                        as="select"
                        value={selectedBranchId}
                        onChange={e => setSelectedBranchId(e.target.value)}
                      >
                        <option value="">-- Select --</option>
                        {branches.map(b => (
                          <option key={b._id} value={b._id}>
                            {b.restaurantName} - {b.branchName} ({b.address?.fullAddress})
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  )}

                  <Button onClick={handleAddToCart}>Add to Cart</Button>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Container>
      </div>
      {!isDesktop && <CustomerBottomNavbar />}
      <CartSummary cart={cart} />
      <DeliveryLocationButton />
    </div>
  );
}

export default MenuItemDetails;
