import React, { useState, useEffect } from 'react';
import CustomerBottomNavbar from '../../../components/CustomerBottomNavbar/CustomerBottomNavbar';
import CustomerSideBar from '../../../components/CustomerSideBar/CustomerSideBar';
import { useMediaQuery } from 'react-responsive';
import api from '../../../api';
import { Form, InputGroup, ListGroup, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; 

function CustomerRestaurantSearch() {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [randomRestaurants, setRandomRestaurants] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        api.get(`/api/restaurant/restaurants/search?name=${searchTerm}`)
          .then(res => setResults(res.data))
          .catch(err => console.error(err));
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      api.get('/api/restaurant/restaurants/randomRestaurants')
        .then(res => setRandomRestaurants(res.data.data))
        .catch(err => console.error('Error fetching random restaurants:', err));
    }
  }, [searchTerm]);

  const handleItemClick = (restaurant) => {
    navigate(`/customer/restaurant/${restaurant._id}`, { state: { restaurant } });
  };

  const fallbackImage = 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isDesktop && <CustomerSideBar />}
      <div style={{ flex: 1, backgroundColor: '#FFF8F8', padding: '20px', position: 'relative' }}>
        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        {searchTerm && results.length > 0 && (
          <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {results.map((restaurant) => (
              <ListGroup.Item
                key={restaurant._id}
                action
                onClick={() => handleItemClick(restaurant)}
              >
                <strong>{restaurant.restaurantName}</strong> – {restaurant.branchName}
                <br />
                <small>{restaurant.address.fullAddress}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {randomRestaurants.length > 0 && (
          <div>
            <h5 className="mb-3" style={{marginTop:'50px'}}>Explore Restaurants</h5>
            <Row xs={1} sm={2} md={4} className="g-4">
              {randomRestaurants.map((restaurant) => (
                <Col key={restaurant._id}>
                  <Card
                    className="h-100"
                    style={{ cursor: 'pointer', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}
                    onClick={() => handleItemClick(restaurant)}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '75%',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={restaurant.restaurantImage || fallbackImage}
                        alt={restaurant.restaurantName}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderTopLeftRadius: '8px',
                          borderTopRightRadius: '8px',
                        }}
                        onError={(e) => (e.target.src = fallbackImage)}
                      />
                    </div>
                    <Card.Body>
                      <Card.Title style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {restaurant.restaurantName}
                      </Card.Title>
                      <Card.Text style={{ fontSize: '0.9rem', color: '#555' }}>
                        {restaurant.branchName}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              </Row>
              <br/><br/><br/>
              </div>
        )}
      </div>
      {!isDesktop && <CustomerBottomNavbar />}
    </div>
  );
}

export default CustomerRestaurantSearch;
