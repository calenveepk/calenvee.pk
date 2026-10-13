import { PromoCode } from '../types';

/**
 * ==============================================================================
 * CALENVEE STORE PROMOTIONS & COUPON CODES
 * ==============================================================================
 * Add, edit, or remove store discount codes below.
 * Customers can enter these codes at checkout or in their cart.
 * ==============================================================================
 */
export const AVAILABLE_PROMOS: Record<string, PromoCode> = {
  'CAMPUS20': {
    code: 'CAMPUS20',
    discountPercentage: 20,
    minOrderValue: 2000,
    description: '20% Student Discount for University Students',
  },
  'GENZ15': {
    code: 'GENZ15',
    discountPercentage: 15,
    minOrderValue: 1500,
    description: '15% Off Your Entire Cart',
  },
  'CALENVEE10': {
    code: 'CALENVEE10',
    discountPercentage: 10,
    minOrderValue: 1000,
    description: '10% Welcome Discount for New Shoppers',
  },
  'SAVE5': {
    code: 'SAVE5',
    discountPercentage: 5,
    minOrderValue: 500,
    description: '5% Instant Cash on Delivery Savings',
  },
};

/**
 * Homepage Sale Banner Text & Settings
 */
export const STORE_SALE_OFFER = {
  active: true,
  badgeText: "%",
  headline: "UP TO 40% OFF",
  subheading: "Limited time offer on selected university & daily lifestyle items across Pakistan.",
  ctaText: "SHOP THE SALE",
  ctaLink: "/shop",
};
