import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Card, Button, Row, Col, Container, Spinner, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import CartSummary from '../Cart/CartSummary';
import { useCart } from '../../context/CartContext';
import Toast from '../../utils/toast';

function RestaurantMenu({ restaurantId }) {
  const [groupedByCategory, setGroupedByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState({});
  const [restaurantName, setRestaurantName] = useState('');
  const [branchName, setBranchName] = useState('');


  const { cart, addToCart } = useCart();

  useEffect(() => {
    api.get(`/api/restaurant/menu/restaurant/${restaurantId}`)
      .then((res) => {
        const grouped = res.data.reduce((acc, item) => {
          const category = item.category.name;
          if (!acc[category]) acc[category] = [];
          acc[category].push(item);
          return acc;
        }, {});
        setGroupedByCategory(grouped);

        const defaultQuantities = {};
        res.data.forEach(item => {
          defaultQuantities[item._id] = 1;
        });
        setQuantities(defaultQuantities);

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    api.get(`/api/restaurant/restaurants/getDetails/${restaurantId}`)
    .then((res) => {
      setRestaurantName(res.data.restaurantName);
      setBranchName(res.data.branchName);
    })
    .catch((err) => {
      console.error("Error fetching restaurant details", err);
      Toast({ type: 'error', message: 'Error fetching restaurant details' });
    })
    .finally(() => {
      setLoading(false);
    });
  }, [restaurantId]);

  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  const increment = (id) => {
    setQuantities(prev => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const decrement = (id) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max((prev[id] || 1) - 1, 1),
    }));
  };

  const handleAddToCart = (item) => {
    const quantity = quantities[item._id] || 1;

    addToCart({
      ...item,
      restaurantId,
      restaurantName,
      branchName,
    }, quantity);

    Toast({ type: 'success', message: `${quantity} ${item.name} added to cart successfully!` });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <Container>
      <Form.Control
        type="text"
        placeholder="Search menu..."
        className="mb-4"
        onChange={handleSearch}
        style={{ width: '500px' }}
      />

      {Object.entries(groupedByCategory).map(([category, items]) => {
        const filteredItems = items.filter(item =>
          item.name.toLowerCase().includes(search)
        );
        if (filteredItems.length === 0) return null;

        return (
          <div key={category} className="mb-5">
            <h4 className="mb-3">{category}</h4>
            <Row>
              {filteredItems.map(item => (
                <Col key={item._id} xs={12} sm={6} md={3} className="mb-3">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card style={{ height: '100%' }}>
                      <Card.Img
                        variant="top"
                        src={item.image}
                        alt={item.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Card.Body>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>{item.description}</Card.Text>
                        <Card.Text><strong>Rs. {item.price}</strong></Card.Text>

                        <div className="d-flex align-items-center gap-2 mb-2">
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => decrement(item._id)}
                          >
                            -
                          </button>

                          <span className="fw-bold">
                            {quantities[item._id] || 1}
                          </span>

                          <button
                            className="btn btn-sm btn-danger"
                            style={{backgroundColor:'green', borderColor:'green'}}
                            onClick={() => increment(item._id)}
                          >
                            +
                          </button>
                        </div>

                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={!item.available}
                          onClick={() => handleAddToCart(item)}
                        >
                          {item.available ? 'Add to Cart' : 'Unavailable'}
                        </Button>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        );
      })}

      <CartSummary cart={cart} />
    </Container>
  );
}

export default RestaurantMenu;