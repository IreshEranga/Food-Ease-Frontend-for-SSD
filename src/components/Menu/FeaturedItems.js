// import React, { useEffect, useState } from 'react';
// import { Row, Col, Card } from 'react-bootstrap';
// import loadingGIF from '../../assets/GIF/loading.gif';
// import api from '../../api';
// import { useNavigate } from 'react-router-dom';

// function FeaturedItems() {
//   const [featuredItems, setFeaturedItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchFeaturedItems = async () => {
//       try {
//         const res = await api.get('/api/restaurant/menu/featuredMenu');
//         setFeaturedItems(res.data.items || []);
//       } catch (err) {
//         console.error('Error fetching featured items:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFeaturedItems();
//   }, []);

//   const handleCardClick = (item) => {
//     navigate(`/menu-item/${item._id}`, { state: { item } });
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
//         <img src={loadingGIF} alt="Loading..." style={{ width: '80px' }} />
//       </div>
//     );
//   }

//   return (
//     <div className="container mt-4">
//       <h4 className="mb-3">Featured Menu Items</h4>
//       <Row>
//         {featuredItems.map(item => (
//           <Col key={item._id} xs={6} md={3} className="mb-4">
//             <Card 
//               className="h-100 shadow-sm"
//               onClick={() => handleCardClick(item)}
//               style={{ cursor: 'pointer' }}
//             >
//               <Card.Img 
//                 variant="top" 
//                 src={item.image || 'https://via.placeholder.com/150'} 
//                 alt={item.name} 
//                 style={{ objectFit: 'cover', height: '180px' }}
//               />
//               <Card.Body>
//                 <Card.Title>{item.name}</Card.Title>
//                 <Card.Text className="text-muted">Rs.{item.price.toFixed(2)}</Card.Text>
//               </Card.Body>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     </div>
//   );
// }

// export default FeaturedItems;


import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import './FeaturedItems.css';

function FeaturedItems() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const res = await api.get('/api/restaurant/menu/featuredMenu');
        setFeaturedItems(res.data.items || []);
      } catch (err) {
        console.error('Error fetching featured items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  const handleCardClick = (item) => {
    navigate(`/menu-item/${item._id}`, { state: { item } });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h4 className="mb-3 orange-text">Featured Menu Items</h4>
        <Row>
          {[...Array(4)].map((_, index) => (
            <Col key={index} xs={6} md={3} className="mb-4">
              <Card className="h-100 shadow-sm">
                <div className="skeleton skeleton-image" style={{ height: '180px' }} />
                <Card.Body>
                  <div className="skeleton skeleton-title" style={{ height: '1.5rem', width: '80%', marginBottom: '1rem' }} />
                  <div className="skeleton skeleton-text" style={{ height: '1rem', width: '50%' }} />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{margin:'50px'}}>
      <h4 className="mb-3 orange-text">Featured Menu Items</h4>
      <Row>
        {featuredItems.map(item => (
          <Col key={item._id} xs={6} md={3} className="mb-4">
            <Card 
              className="h-100 shadow-sm"
              onClick={() => handleCardClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <Card.Img 
                variant="top" 
                src={item.image || 'https://via.placeholder.com/150'} 
                alt={item.name} 
                style={{ objectFit: 'cover', height: '180px' }}
              />
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text className="text-muted">Rs.{item.price.toFixed(2)}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default FeaturedItems;