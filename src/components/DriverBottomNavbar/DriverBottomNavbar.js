import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { IoHomeOutline, IoFastFoodOutline, IoCartOutline, IoPersonOutline, IoSettingsOutline } from 'react-icons/io5';

const DriverBottomNavbar = () => {
  return (
    <Navbar 
      fixed="bottom" 
      variant="light" 
      className="d-md-none justify-content-around shadow" 
      style={{ backgroundColor: 'rgb(255, 99, 71)' }}
    >
      <Nav className="w-100 d-flex justify-content-around">
        <Nav.Link href="/customer" style={{ color: '#fff' }}><IoHomeOutline size={24} /></Nav.Link>
        <Nav.Link href="/customer/restaurants" style={{ color: '#fff' }}><IoFastFoodOutline size={24} /></Nav.Link>
        <Nav.Link href="/customer/cart" style={{ color: '#fff' }}><IoCartOutline size={24} /></Nav.Link>
        <Nav.Link href="/customer/profile" style={{ color: '#fff' }}><IoPersonOutline size={24} /></Nav.Link>
        <Nav.Link href="/settings" style={{ color: '#fff' }}><IoSettingsOutline size={24} /></Nav.Link>
      </Nav>
    </Navbar>
  );
};

export default DriverBottomNavbar;
