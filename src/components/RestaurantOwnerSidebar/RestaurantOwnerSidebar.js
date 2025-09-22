import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { MdOutlineRestaurantMenu, MdOutlineAddHomeWork } from "react-icons/md";
import { BiSolidOffer } from "react-icons/bi";
import { 
  FaTachometerAlt, 
  FaShoppingCart, 
  FaSignOutAlt,  
  FaDollarSign, 
  FaUser
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RestaurantOwnerSidebar.css';

const RestaurantOwnerSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      localStorage.clear();
      navigate('/login', { replace: true });
      
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'; 
        }
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const sidebarStyle = {
    height: '100vh',
    width: isExpanded ? '250px' : '80px',
    backgroundColor: '#ff6347',
    position: 'fixed',
    top: 0,
    left: 0,
    transition: 'width 0.3s ease',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 0',
  };

  const contentStyle = {
    marginLeft: isExpanded ? '250px' : '80px',
    transition: 'margin-left 0.3s ease',
  };

  const navItemStyle = {
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    cursor: 'pointer',
  };

  return (
    <>
      <div 
        className="ros-sidebar-container"
        style={sidebarStyle}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div>
          <div className="ros-sidebar-header text-center py-3">
            <h4 className="ros-sidebar-title m-0">{isExpanded ? "TastiGo" : "TG"}</h4>
          </div>

          <Nav className="ros-sidebar-nav flex-column" style={{ marginTop: '30px' }}>
            <Nav.Link className="ros-sidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/restaurant-owner')}>
              <FaTachometerAlt size={20} />
              {isExpanded && <span className="ros-sidebar-navText">Dashboard</span>}
            </Nav.Link>
            <Nav.Link className="ros-sidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/restaurant-owner/restaurants')}>
              <MdOutlineAddHomeWork size={20} />
              {isExpanded && <span className="ros-sidebar-navText">Restaurants</span>}
            </Nav.Link>
            <Nav.Link className="ros-sidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/restaurant-owner/menu')}>
              <MdOutlineRestaurantMenu size={20} />
              {isExpanded && <span className="ros-sidebar-navText">Menu</span>}
            </Nav.Link>
            <Nav.Link className="ros-sidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/restaurant-owner/offers')}>
              <BiSolidOffer size={20} />
              {isExpanded && <span className="ros-sidebar-navText">Offers</span>}
            </Nav.Link>
            <Nav.Link className="ros-sidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/restaurant-owner/orders')}>
              <FaShoppingCart size={20} />
              {isExpanded && <span className="ros-sidebar-navText">Orders</span>}
            </Nav.Link>
            <Nav.Link className="ros-sidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/restaurant-owner/payments')}>
              <FaDollarSign size={20} />
              {isExpanded && <span className="ros-sidebar-navText">Payments</span>}
            </Nav.Link>
            <Nav.Link className="ros-sidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/restaurant-owner/profile')}>
              <FaUser size={20} />
              {isExpanded && <span className="ros-sidebar-navText">Profile</span>}
            </Nav.Link>
            {/*<Nav.Link className="ros-sidebar-navItem" style={navItemStyle}>
              <FaCog size={20} />
              {isExpanded && <span className="ros-sidebar-navText">Settings</span>}
            </Nav.Link>*/}
          </Nav>
        </div>

        <div className="ros-sidebar-footer" style={{ padding: '0 20px' }}>
          <div className="ros-sidebar-userSection d-flex align-items-center justify-content-between">
            {isExpanded && (
              <button 
                className="ros-sidebar-logoutBtn btn btn-outline-light btn-sm"
                style={{ borderRadius: '20px', width: '400px', fontWeight: 'bold', fontSize: '20px' }}
                onClick={handleLogout}
              >
                Logout
                <FaSignOutAlt size={20} style={{ marginLeft: '10px' }} />
              </button>
            )}
            {!isExpanded && (
              <FaSignOutAlt size={20} style={{ marginLeft: '10px' }} />
            )}
          </div>
        </div>
      </div>

      <div className="ros-sidebar-content" style={contentStyle}>
      </div>
    </>
  );
};

export default RestaurantOwnerSidebar;