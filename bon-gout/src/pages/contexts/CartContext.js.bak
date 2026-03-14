import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const { user, isLoggedIn } = useAuth();
  const [cart, setCart] = useState([]);

  // Use user-specific key for localStorage
  const storageKey = useMemo(() => {
    return user?.id ? `cart_user_${user.id}` : 'cart_guest';
  }, [user]);

  // Load cart whenever storageKey changes (e.g., on login/logout)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse cart:', error);
        setCart([]);
      }
    } else {
      setCart([]); // Clear if no saved cart for this key
    }
  }, [storageKey]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0 || localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart, storageKey]);

  // Handle logout: Clear cart state immediately
  useEffect(() => {
    if (!isLoggedIn) {
      setCart([]);
    }
  }, [isLoggedIn]);

  // Calculate cart count
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      let newCart;
      
      if (existing) {
        newCart = prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: (cartItem.quantity || cartItem.qty || 0) + 1 }
            : cartItem
        );
      } else {
        newCart = [...prev, { ...item, quantity: 1 }];
      }
      
      toast.success(`${item.name || 'Item'} added to cart! 🛒`);
      return newCart;
    });
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      setCart(prev => {
        toast.success('Item removed from cart');
        return prev.filter(item => item.id !== id);
      });
      return;
    }
    
    setCart(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      toast.success('Item removed from cart');
      return prev.filter(item => item.id !== id);
    });
  };

  const clearCart = (showToast = true) => {
    setCart([]);
    if (showToast) toast.success('Cart cleared!');
  };

  const value = {
    cart,           // Raw cart array
    cartCount,      // Total items count
    cartItems: cart, // Alias for Cart.js compatibility
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
