import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import AppLogo from '../../assets/Images/T.png';

import './FirstPage.css';


function FirstPage() {

  const navigate = useNavigate();

  useEffect(() => {

    const clockDown =  setTimeout(() => {
      navigate('/Login');
    }, 5000);
  
    return () => clearTimeout(clockDown);
  }, [navigate]);

  return (
    <div className='FirstPage-mainContent'>
      <img src={AppLogo} alt="Tastigo Logo" className="FirstPage-logo" />
      <h1 style={{color:'white', textAlign:'center'}}>Tastigo</h1>
    </div>
  )
}

export default FirstPage;