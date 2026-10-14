import { createContext, useContext, useState, useMemo, useEffect } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'vernalrx_cart';

const loadStoredCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadStoredCart);

  // Keep the cart across page refreshes / closing the tab
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable (private mode / quota) - cart still works for this session
    }
  }, [items]);

  const addItem = (product, quantity = 1) => {
    const addCount = Math.max(1, Number(quantity) || 1);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + addCount } : i));
      }
      return [...prev, { ...product, qty: addCount }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return removeItem(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
