import React, { useEffect, useState } from 'react';
import CustomerSideBar from '../../../components/CustomerSideBar/CustomerSideBar';
import CustomerBottomNavbar from '../../../components/CustomerBottomNavbar/CustomerBottomNavbar';
import { useMediaQuery } from 'react-responsive';
import { getGreeting } from '../../../utils/getGreeting';
import { useAuthStore } from '../../../store/useAuthStore';
import api from '../../../api';
import { motion } from 'framer-motion';
import CategoryDisplay from '../../../components/Category/CategoryDisplay';
import PizzaImage from '../../../assets/Images/Pizza.png';
import BurgerImage from '../../../assets/Images/Burger.png';
import SubmarineImage from '../../../assets/Images/Submarine.png';
import FeaturedItems from '../../../components/Menu/FeaturedItems';
import DeliveryLocationButton from '../../../components/DeliveryLocation/DeliveryLocation';
import './CustomerHome.css';

function CustomerHome() {
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const [customerName, setCustomerName] = useState('');

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/users/customers/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomerName(response.data.data.name);
      } catch (error) {
        console.error("Error fetching customer profile", error);
      }
    };

    fetchProfile();
  }, [token]);

  const categories = [
    { name: 'Pizza', image: PizzaImage },
    { name: 'Burgers', image: BurgerImage },
    { name: 'Submarine', image: SubmarineImage },
  ];

  return (
    <div className="CustomerHome-container">
      {isDesktop && <CustomerSideBar />}
      <div className="CustomerHome-content">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="CustomerHome-greeting"
        >
          {getGreeting()}, {customerName}!
        </motion.h2>

        <CategoryDisplay categories={categories} />

        <FeaturedItems />

        <div className="CustomerHome-spacer"></div>
      </div>

      {!isDesktop && <CustomerBottomNavbar />}

      <DeliveryLocationButton isDesktop={isDesktop} />
    </div>
  );
}

export default CustomerHome;