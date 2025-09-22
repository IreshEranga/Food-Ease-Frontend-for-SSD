import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { 
  FaTachometerAlt, 
  FaUser, 
  FaTruck, 
  FaBell, 
  FaSignOutAlt,
  FaListAlt 
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';


const RiderSidebar = () => {
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
    color: 'white'
  };

  return (
    <>
      <div 
        className="riderSidebar-container"
        style={sidebarStyle}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Top of side bar */}
        <div>
          <div className="riderSidebar-header text-center py-3">
            <h4 className="riderSidebar-title m-0">{isExpanded ? "TastiGo" : "TG"}</h4>
          </div>

          {/* Navigation Menu */}
          <Nav className="riderSidebar-nav flex-column">
            <Nav.Link className="riderSidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/rider')}>
              <FaTachometerAlt size={20} />
              {isExpanded && <span className="riderSidebar-navText">Dashboard</span>}
            </Nav.Link>
            
            <Nav.Link className="riderSidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/rider/profile')}>
              <FaUser size={20} />
              {isExpanded && <span className="riderSidebar-navText">Profile</span>}
            </Nav.Link>

            <Nav.Link className="riderSidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/rider/delivery')}>
              <FaTruck size={20} />
              {isExpanded && <span className="riderSidebar-navText">Delivery</span>}
            </Nav.Link>

            <Nav.Link className="riderSidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/rider/all-deliveries')}>
              <FaListAlt size={20} />
              {isExpanded && <span className="riderSidebar-navText">All Deliveries</span>}
            </Nav.Link>

            <Nav.Link className="riderSidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/rider/notifications')}>
              <FaBell size={20} />
              {isExpanded && <span className="riderSidebar-navText">Notifications</span>}
            </Nav.Link>
          </Nav>
        </div>

        {/* Bottom Section */}
        <div className="riderSidebar-footer" style={{ padding: '0 20px' }}>
          <div className="riderSidebar-userSection d-flex align-items-center justify-content-between">
            {isExpanded && (
              <button 
                className="riderSidebar-logoutBtn btn btn-outline-light btn-sm"
                style={{ borderRadius: '20px', width: '100%', fontWeight: 'bold', fontSize: '20px' }}
                onClick={handleLogout}
              >
                <FaSignOutAlt size={20} style={{ marginLeft: '10px' }} />
                Logout
              </button>
            )}
            {!isExpanded && (
              <FaSignOutAlt size={20} style={{ marginLeft: '10px' }} />
            )}
          </div>
        </div>
      </div>

      <div className="riderSidebar-content" style={contentStyle}>
        {/* Add the content of the page here */}
      </div>
    </>
  );
};

export default RiderSidebar;
