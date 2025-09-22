import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nav, NavDropdown } from 'react-bootstrap';
import { 
  FaTachometerAlt, 
  FaUtensils, 
  FaShoppingCart, 
  FaSignOutAlt, 
  FaUser,
  FaTruck, 
  FaChartBar, 
  FaPeopleArrows 
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminSidebar.css';

const AdminSidebar = () => {
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
        className="adminSidebar-container"
        style={sidebarStyle}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Top of side bar */}
        <div>
          <div className="adminSidebar-header text-center py-3">
            <h4 className="adminSidebar-title m-0">{isExpanded ? "TastiGo" : "TG"}</h4>
          </div>

          {/* Navigation Menu */}
          <Nav className="adminSidebar-nav flex-column">
            <Nav.Link className="adminSidebar-navItem" style={navItemStyle} onClick={() => handleNavigation('/admin')}>
              <FaTachometerAlt size={20} />
              {isExpanded && <span className="adminSidebar-navText">Dashboard</span>}
            </Nav.Link>
            <Nav.Link className="adminSidebar-navItem" style={navItemStyle}
              onClick={() => handleNavigation('/admin/restaurants')}>
              <FaUtensils size={20} />
              {isExpanded && <span className="adminSidebar-navText">Restaurants</span>}
            </Nav.Link>
            <Nav.Link className="adminSidebar-navItem" style={navItemStyle}
            onClick={() => handleNavigation('/admin/orders')}>
              <FaShoppingCart size={20} />
              {isExpanded && <span className="adminSidebar-navText">Orders</span>}
            </Nav.Link>
            
            <Nav.Link className="adminSidebar-navItem" style={navItemStyle}>
              <FaTruck size={20} />
              {isExpanded && <span className="adminSidebar-navText">Delivery</span>}
            </Nav.Link>
            <Nav.Link className="adminSidebar-navItem" style={navItemStyle}
            onClick={() => handleNavigation('/admin/roles')}>
              <FaPeopleArrows  size={20} />
              {isExpanded && <span className="adminSidebar-navText">Roles</span>}
            </Nav.Link>
            <Nav.Link className="adminSidebar-navItem" style={navItemStyle}
            onClick={() => handleNavigation('/admin/analytics')}>
              <FaChartBar size={20} />
              {isExpanded && <span className="adminSidebar-navText">Analytics</span>}
            </Nav.Link>
            {/* Users Dropdown */}
            <div className="adminSidebar-navItem" style={navItemStyle}>
              <FaUser size={20} />
              {isExpanded && (
                <NavDropdown 
                  title="Users" 
                  id="users-dropdown"
                  className="adminSidebar-dropdown"
                  style={{marginLeft:'15px'}}
                >
                  <NavDropdown.Item href="/admin/customers">
                    Customers
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/admin/restaurant-owners">
                    Restaurant Owners
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/admin/driders">
                    Delivery Riders
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </div>
            
          </Nav>
        </div>

        {/* Bottom Section */}
        <div className="adminSidebar-footer" style={{ padding: '0 20px' }}>
          <div className="adminSidebar-userSection d-flex align-items-center justify-content-between">
            {isExpanded && (
              <button 
                className="adminSidebar-logoutBtn btn btn-outline-light btn-sm"
                style={{ borderRadius: '20px', width:'400px', fontWeight:'bold', fontSize:'20px' }}
                onClick={handleLogout}
              >
                
                <FaSignOutAlt size={20} style={{marginLeft:'10px'}}/>
                Logout
              </button>
            )}
            {!isExpanded && (
                <FaSignOutAlt size={20} style={{marginLeft:'10px'}}/>
            )}
          </div>
        </div>
      </div>

      
      <div className="adminSidebar-content" style={contentStyle}>
        
      </div>
    </>
  );
};

export default AdminSidebar;