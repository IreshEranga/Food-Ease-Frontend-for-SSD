import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = sessionStorage.getItem('globalCart');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync with sessionStorage
  useEffect(() => {
    sessionStorage.setItem('globalCart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (item, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(
        i => i._id === item._id && i.restaurantId === item.restaurantId
      );
      if (existing) {
        return prev.map(i =>
          i._id === item._id && i.restaurantId === item.restaurantId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  // Update item quantity in cart
  const updateCartQuantity = (itemId, quantity) => {
    setCart(prev =>
      prev.map(item =>
        item._id === itemId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  // Remove item from cart
  const removeItemFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item._id !== itemId));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartQuantity,
        removeItemFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
