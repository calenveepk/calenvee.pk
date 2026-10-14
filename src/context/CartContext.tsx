import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariantColor, ProductVariantSize, CartItem, PromoCode } from '../types';
import { AVAILABLE_PROMOS } from '../data/promotions';
import storeSettingsData from '../data/storeSettings.json';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (product: Product, color?: ProductVariantColor, size?: ProductVariantSize, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  finalTotal: number;
  appliedPromo: PromoCode | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  freeShippingProgress: number; // 0 to 100%
  amountUntilFreeShipping: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('calenvee_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(() => {
    try {
      const saved = localStorage.getItem('calenvee_promo');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(() => {
    return Number(storeSettingsData.freeShippingThreshold) || 3500;
  });

  const [standardShippingFee, setStandardShippingFee] = useState<number>(() => {
    return Number(storeSettingsData.standardShippingFee) || 250;
  });

  useEffect(() => {
    // Only query local admin server when running on localhost (prevents browser "Access local devices" security prompt on live production site)
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      const syncLiveSettings = async () => {
        try {
          const res = await fetch('http://localhost:4200/api/settings');
          if (res.ok) {
            const data = await res.json();
            if (data.freeShippingThreshold) setFreeShippingThreshold(Number(data.freeShippingThreshold));
            if (data.standardShippingFee !== undefined) setStandardShippingFee(Number(data.standardShippingFee));
          }
        } catch (_) {
          // Fallback: storeSettingsData is already active
        }
      };
      syncLiveSettings();
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('calenvee_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to local storage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedPromo) {
        localStorage.setItem('calenvee_promo', JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem('calenvee_promo');
      }
    } catch (e) {
      console.error('Error saving promo to local storage', e);
    }
  }, [appliedPromo]);

  const addItem = (
    product: Product,
    color?: ProductVariantColor,
    size?: ProductVariantSize,
    quantity = 1
  ) => {
    const selectedColor = color || product.colors[0] || { name: 'Default', hex: '#000000', inStock: true };
    const selectedSize = size || (product.sizes ? product.sizes[0] : undefined);
    const itemId = `${product.id}-${selectedColor.name}-${selectedSize ? selectedSize.name : 'default'}`;

    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === itemId);
      if (existing) {
        return prevItems.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prevItems,
        {
          id: itemId,
          product,
          selectedColor,
          selectedSize,
          quantity,
        },
      ];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
  };

  const applyPromoCode = (code: string) => {
    const upper = code.trim().toUpperCase();
    const promo = AVAILABLE_PROMOS[upper];

    if (!promo) {
      return { success: false, message: 'Invalid coupon code. Try CAMPUS20 or GENZ15!' };
    }

    if (subtotal < promo.minOrderValue) {
      return {
        success: false,
        message: `Code requires minimum order of Rs. ${promo.minOrderValue.toLocaleString()}`,
      };
    }

    setAppliedPromo(promo);
    return { success: true, message: `Code ${promo.code} applied successfully! (${promo.discountPercentage}% OFF)` };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const discount = appliedPromo
    ? Math.round((subtotal * appliedPromo.discountPercentage) / 100)
    : 0;

  const isFreeShipping = subtotal >= freeShippingThreshold || items.length === 0;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : standardShippingFee;
  const finalTotal = Math.max(0, subtotal - discount + shippingFee);

  const amountUntilFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        shippingFee,
        finalTotal,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        freeShippingProgress,
        amountUntilFreeShipping,
        freeShippingThreshold,
        standardShippingFee,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

