import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState({});

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart');
      const items = response.data?.cart || [];
      setCartItems(items);
    } catch (err) {
      const status = err.statusCode || err.response?.status;
      if (status === 401) {

        setCartItems([]);
      } else {
        const msg = err.response?.data?.message || err.message || 'Unable to load cart';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    api.get('/cart')
      .then((res) => {
        if (!ignore) {
          setCartItems(res.data?.cart || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          const status = err.statusCode || err.response?.status;
          if (status !== 401) {
            setError(err.response?.data?.message || err.message || 'Unable to load cart');
          }
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setActionLoading((prev) => ({ ...prev, [productId]: 'adding' }));
    try {
      const payload = quantity > 1 ? { quantity } : {};
      const response = await api.post(`/cart/${productId}`, payload);
      const updatedCart = response.data?.cart || [];
      setCartItems(updatedCart);
      return { success: true, message: response.data?.message || 'Product added to cart' };
    } catch (err) {
      const message =
        err.response?.data?.message || err.statusMessage || err.message || 'Failed to add to cart';
      const statusCode = err.statusCode || err.response?.status || 500;
      return { success: false, message, statusCode };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  }, []);

  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (newQuantity < 1) {
      return await removeFromCart(productId);
    }

    setActionLoading((prev) => ({ ...prev, [productId]: 'updating' }));
    try {
      const response = await api.patch(`/cart/${productId}`, { quantity: newQuantity });
      const updatedCart = response.data?.cart || [];
      setCartItems(updatedCart);
      return { success: true, message: response.data?.message || 'Cart updated' };
    } catch (err) {
      const message =
        err.response?.data?.message || err.statusMessage || err.message || 'Failed to update quantity';
      const statusCode = err.statusCode || err.response?.status || 500;
      return { success: false, message, statusCode };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: 'removing' }));
    try {
      const response = await api.delete(`/cart/${productId}`);
      const updatedCart = response.data?.cart || [];
      setCartItems(updatedCart);
      return { success: true, message: response.data?.message || 'Item removed from cart' };
    } catch (err) {
      const message =
        err.response?.data?.message || err.statusMessage || err.message || 'Failed to remove item';
      const statusCode = err.statusCode || err.response?.status || 500;
      return { success: false, message, statusCode };
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const isInCart = useCallback(
    (productId) => {
      return cartItems.some(
        (item) => (item.product?._id || item.product) === productId
      );
    },
    [cartItems]
  );

  const getItemQuantity = useCallback(
    (productId) => {
      const found = cartItems.find(
        (item) => (item.product?._id || item.product) === productId
      );
      return found ? found.quantity : 0;
    },
    [cartItems]
  );

  const totalUnits = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = Number(item.product?.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + price * qty;
    }, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    loading,
    error,
    actionLoading,
    totalUnits,
    totalItems,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => { const context = React.useContext(CartContext); if (!context) throw new Error('useCart must be used within a CartProvider'); return context; };
export default CartContext;
