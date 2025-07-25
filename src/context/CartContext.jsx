import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('salesCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          return parsedCart.map(item => ({
            ...item,
            unitPrice: parseFloat(item.unitPrice),
            quantity: parseInt(item.quantity),
            discountPercentage: parseFloat(item.discountPercentage || 0)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
    return [];
  });

  useEffect(() => {
    if (cart.length > 0) {
      const validatedCart = cart.map(item => ({
        ...item,
        unitPrice: parseFloat(item.unitPrice),
        quantity: parseInt(item.quantity),
        discountPercentage: parseFloat(item.discountPercentage || 0)
      }));
      localStorage.setItem('salesCart', JSON.stringify(validatedCart));
    } else {
      localStorage.removeItem('salesCart');
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingItemIndex >= 0) {
        return prevCart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('salesCart');
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
