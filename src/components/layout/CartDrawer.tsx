import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPKR } from '../../utils/formatters';
import { RealisticShieldIcon } from '../common/RealisticIcons';

export const CartDrawer: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    shippingFee,
    finalTotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    freeShippingProgress,
    amountUntilFreeShipping,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const navigate = useNavigate();

  // Prevent background page scrolling when cart drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMessage({ text: res.message, isError: !res.success });
    if (res.success) setPromoInput('');
  };

  const handleCheckoutClick = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden animate-in fade-in duration-200">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Container: Full width on mobile (< sm), max-w-md on desktop */}
      <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-white text-gray-900 flex flex-col justify-between shadow-2xl border-l border-gray-200 h-full relative z-10">
          
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                  Shopping Cart
                </h2>
                <span className="text-[11px] text-gray-500 font-medium">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in your bag
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress & COD Delivery Notice */}
          <div className="bg-gradient-to-r from-orange-50/90 to-amber-50/70 px-4 py-3 border-b border-orange-100 shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-gray-800">
                <Truck className="w-4 h-4 text-[#F97316] shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  {amountUntilFreeShipping === 0 ? (
                    <strong className="text-emerald-700 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Free Shipping Unlocked!
                    </strong>
                  ) : (
                    <span>
                      Add <strong className="text-[#F97316]">{formatPKR(amountUntilFreeShipping)}</strong> more for <strong>FREE Delivery</strong>
                    </span>
                  )}
                </span>
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#F97316] bg-white px-2 py-0.5 rounded-full border border-orange-200 shadow-2xs">
                COD Pakistan
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-orange-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#F97316] to-[#EA580C] h-full rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 bg-gray-50/60 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center text-[#F97316] border border-orange-100 shadow-xs">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-gray-900 font-extrabold text-base">Your cart is empty</h3>
                  <p className="text-xs text-gray-500 max-w-xs font-normal leading-relaxed">
                    Discover luxury timepieces, designer sunglasses, and premium accessories tailored for you.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-3 bg-[#0B132B] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="pt-3 first:pt-0 flex items-center space-x-3.5 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs"
                >
                  {/* Strict Fixed 80x80 Thumbnail Container */}
                  <div className="w-20 h-20 min-w-[80px] max-w-[80px] h-20 min-h-[80px] max-h-[80px] rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 self-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Details Column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors flex-shrink-0"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-gray-500 font-medium">
                        <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md text-[10px]">
                          <span
                            className="w-2 h-2 rounded-full inline-block border border-gray-300"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          {item.selectedColor.name}
                        </span>
                        {item.selectedSize && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md text-[10px]">
                            {item.selectedSize.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-100">
                      <div className="text-sm font-extrabold text-[#0B132B]">
                        {formatPKR(item.product.price * item.quantity)}
                      </div>

                      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-white hover:bg-gray-200 text-gray-700 shadow-2xs active:scale-90 transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-2 text-gray-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-white hover:bg-gray-200 text-gray-700 shadow-2xs active:scale-90 transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Order Summary, Coupon & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white space-y-3.5 shrink-0 shadow-lg">
              {/* Promo Code Form */}
              <div className="space-y-1.5">
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Code <strong>{appliedPromo.code}</strong> applied ({appliedPromo.discountPercentage}% OFF)
                      </span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-gray-500 hover:text-black text-[11px] font-bold underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="COUPON CODE (E.G. WELCOME10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 min-w-0 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 uppercase placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0B132B] hover:bg-black text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap shadow-xs"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {promoMessage && (
                  <p className={`text-[11px] ${promoMessage.isError ? 'text-red-500' : 'text-emerald-600'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* Order breakdown */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-semibold">{formatPKR(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPKR(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Shipping (Pakistan)</span>
                  <span className={shippingFee === 0 ? 'text-emerald-600 font-bold' : 'text-gray-900 font-semibold'}>
                    {shippingFee === 0 ? 'FREE' : formatPKR(shippingFee)}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">Total Amount</span>
                  <span className="text-[#0B132B] font-extrabold text-lg sm:text-xl">
                    {formatPKR(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-500 text-center pt-0.5">
                <RealisticShieldIcon size={14} />
                <span>Cash on Delivery (7-10 Days) & Instant Accounts</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CartDrawer;
