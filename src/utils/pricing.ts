import { Product, CartItem, PromoCode, Deal } from '../types';

export interface EffectivePriceResult {
  originalPrice: number;
  catalogPrice: number;
  effectivePrice: number;
  discountAmount: number;
  discountPercentage: number;
  appliedDeal: Deal | null;
  isDealActive: boolean;
}

export interface CartLineItemPricing {
  itemId: string;
  productId: string;
  name: string;
  quantity: number;
  unitCatalogPrice: number;
  unitEffectivePrice: number;
  lineSubtotal: number;
  lineOriginalTotal: number;
  lineSavings: number;
  appliedDeal: Deal | null;
}

export interface ShippingConfig {
  freeShippingThreshold: number;
  standardShippingFee: number;
}

export interface CartTotalsResult {
  itemsCount: number;
  lineItems: CartLineItemPricing[];
  subtotal: number;
  originalSubtotal: number;
  dealSavings: number;
  couponDiscount: number;
  appliedCoupon: PromoCode | null;
  shippingFee: number;
  finalTotal: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  isFreeShipping: boolean;
  amountUntilFreeShipping: number;
  freeShippingProgress: number;
}

/**
 * Normalizes any timestamp, Date, or ISO string to epoch milliseconds.
 * All deal windows are evaluated strictly against ISO 8601 datetimes in Asia/Karachi (UTC+5).
 */
export function normalizeNowMs(now?: Date | number | string): number {
  if (now === undefined || now === null) {
    return Date.now();
  }
  if (typeof now === 'number') {
    return now;
  }
  if (now instanceof Date) {
    return now.getTime();
  }
  const parsed = Date.parse(now);
  return isNaN(parsed) ? Date.now() : parsed;
}

/**
 * Checks if a deal is currently valid and within its active Asia/Karachi (UTC+5) window.
 */
export function isDealActive(deal: Deal, nowMs?: number): boolean {
  if (!deal || !deal.active) return false;
  const current = nowMs !== undefined ? nowMs : Date.now();
  const start = Date.parse(deal.startDateTime);
  const end = Date.parse(deal.endDateTime);
  if (isNaN(start) || isNaN(end)) return false;
  return current >= start && current <= end;
}

/**
 * Single source of truth for product pricing across Calenvee.pk.
 * Used by ProductCard, ProductDetailPage, CartDrawer, Checkout, and mirrored in Google Apps Script.
 */
export function getEffectivePrice(
  product: Product,
  now?: Date | number | string,
  deals: Deal[] = []
): EffectivePriceResult {
  const nowMs = normalizeNowMs(now);
  const originalPrice = Number(product.originalPrice) || Number(product.price) || 0;
  const catalogPrice = Number(product.price) || 0;

  // Find active deal specifically assigned to this product
  const matchingDeal = deals.find(
    (d) => d.productId === product.id && isDealActive(d, nowMs)
  );

  let effectivePrice = catalogPrice;
  let appliedDeal: Deal | null = null;
  let isDeal = false;

  if (matchingDeal) {
    isDeal = true;
    appliedDeal = matchingDeal;
    if (matchingDeal.dealPrice && matchingDeal.dealPrice > 0) {
      effectivePrice = matchingDeal.dealPrice;
    } else if (matchingDeal.discountPercentage && matchingDeal.discountPercentage > 0) {
      effectivePrice = Math.round(catalogPrice * (1 - matchingDeal.discountPercentage / 100));
    }
  }

  const effectiveOriginal = Math.max(originalPrice, effectivePrice);
  const discountAmount = Math.max(0, effectiveOriginal - effectivePrice);
  const discountPercentage = effectiveOriginal > 0
    ? Math.round((discountAmount / effectiveOriginal) * 100)
    : 0;

  return {
    originalPrice: effectiveOriginal,
    catalogPrice,
    effectivePrice,
    discountAmount,
    discountPercentage,
    appliedDeal,
    isDealActive: isDeal,
  };
}

/**
 * Calculates comprehensive cart totals with reactive deals, coupons, and dynamic shipping thresholds.
 */
export function calculateCartTotals(
  items: CartItem[],
  now?: Date | number | string,
  deals: Deal[] = [],
  appliedCoupon: PromoCode | null = null,
  shippingConfig?: Partial<ShippingConfig>
): CartTotalsResult {
  const nowMs = normalizeNowMs(now);
  const freeThreshold = Number(shippingConfig?.freeShippingThreshold) || 3500;
  const standardFee = Number(shippingConfig?.standardShippingFee) || 250;

  let subtotal = 0;
  let originalSubtotal = 0;
  let dealSavings = 0;
  let itemsCount = 0;

  const lineItems: CartLineItemPricing[] = items.map((item) => {
    const pricing = getEffectivePrice(item.product, nowMs, deals);
    const qty = Math.max(1, Number(item.quantity) || 1);
    const lineSubtotal = pricing.effectivePrice * qty;
    const lineOriginalTotal = pricing.originalPrice * qty;
    const lineSavings = (pricing.catalogPrice - pricing.effectivePrice) * qty;

    subtotal += lineSubtotal;
    originalSubtotal += lineOriginalTotal;
    dealSavings += Math.max(0, lineSavings);
    itemsCount += qty;

    return {
      itemId: item.id,
      productId: item.product.id,
      name: item.product.name,
      quantity: qty,
      unitCatalogPrice: pricing.catalogPrice,
      unitEffectivePrice: pricing.effectivePrice,
      lineSubtotal,
      lineOriginalTotal,
      lineSavings: Math.max(0, lineSavings),
      appliedDeal: pricing.appliedDeal,
    };
  });

  // Calculate Coupon Discount
  let couponDiscount = 0;
  let validCoupon: PromoCode | null = null;

  if (appliedCoupon && appliedCoupon.discountPercentage > 0) {
    const minOrder = Number(appliedCoupon.minOrderValue) || 0;
    if (subtotal >= minOrder) {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountPercentage) / 100);
      validCoupon = appliedCoupon;
    }
  }

  // Calculate Shipping
  const netOrderAmount = Math.max(0, subtotal - couponDiscount);
  const isFreeShipping = items.length === 0 || netOrderAmount >= freeThreshold;
  const shippingFee = (items.length === 0 || isFreeShipping) ? 0 : standardFee;
  const finalTotal = items.length === 0 ? 0 : Math.max(0, netOrderAmount + shippingFee);

  const amountUntilFreeShipping = isFreeShipping ? 0 : Math.max(0, freeThreshold - netOrderAmount);
  const freeShippingProgress = freeThreshold > 0
    ? Math.min(100, Math.max(0, Math.round((netOrderAmount / freeThreshold) * 100)))
    : 100;

  return {
    itemsCount,
    lineItems,
    subtotal,
    originalSubtotal,
    dealSavings,
    couponDiscount,
    appliedCoupon: validCoupon,
    shippingFee,
    finalTotal,
    freeShippingThreshold: freeThreshold,
    standardShippingFee: standardFee,
    isFreeShipping,
    amountUntilFreeShipping,
    freeShippingProgress,
  };
}
