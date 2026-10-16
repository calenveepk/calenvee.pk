import { describe, it, expect } from 'vitest';
import {
  getEffectivePrice,
  calculateCartTotals,
  isDealActive,
  normalizeNowMs,
} from '../src/utils/pricing';
import { Product, CartItem, PromoCode, Deal } from '../src/types';

// Mirrored server implementation matching backend/google-apps-script.js logic
function calculateEffectivePriceServer(
  product: { id: string; price: number; originalPrice?: number },
  nowMs: number,
  deals: Array<{
    id: string;
    productId: string;
    dealPrice?: number;
    discountPercentage?: number;
    startDateTime: string;
    endDateTime: string;
    active: boolean;
  }> = []
) {
  const originalPrice = Number(product.originalPrice) || Number(product.price) || 0;
  const catalogPrice = Number(product.price) || 0;

  let effectivePrice = catalogPrice;
  let isDeal = false;
  let appliedDeal: any = null;

  for (let i = 0; i < deals.length; i++) {
    const d = deals[i];
    if (d.productId === product.id && d.active) {
      const start = Date.parse(d.startDateTime);
      const end = Date.parse(d.endDateTime);
      if (!isNaN(start) && !isNaN(end) && nowMs >= start && nowMs <= end) {
        isDeal = true;
        appliedDeal = d;
        if (d.dealPrice && d.dealPrice > 0) {
          effectivePrice = d.dealPrice;
        } else if (d.discountPercentage && d.discountPercentage > 0) {
          effectivePrice = Math.round(catalogPrice * (1 - d.discountPercentage / 100));
        }
        break;
      }
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
    isDealActive: isDeal,
    appliedDeal,
  };
}

function calculateOrderTotalsServer(
  items: Array<{
    id: string;
    product: { id: string; price: number; originalPrice?: number; name?: string };
    quantity: number;
  }>,
  nowMs: number,
  deals: any[] = [],
  appliedCoupon: { code: string; discountPercentage: number; minOrderValue: number } | null = null,
  settings: { freeShippingThreshold: number; standardShippingFee: number } = { freeShippingThreshold: 3500, standardShippingFee: 250 }
) {
  let subtotal = 0;
  let originalSubtotal = 0;
  let dealSavings = 0;
  let itemsCount = 0;

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const qty = Math.max(1, Number(it.quantity) || 1);
    const pRes = calculateEffectivePriceServer(it.product, nowMs, deals);

    subtotal += pRes.effectivePrice * qty;
    originalSubtotal += pRes.originalPrice * qty;
    dealSavings += Math.max(0, (pRes.catalogPrice - pRes.effectivePrice) * qty);
    itemsCount += qty;
  }

  let couponDiscount = 0;
  if (appliedCoupon && appliedCoupon.discountPercentage > 0) {
    if (subtotal >= (appliedCoupon.minOrderValue || 0)) {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountPercentage) / 100);
    }
  }

  const net = Math.max(0, subtotal - couponDiscount);
  const isFree = items.length === 0 || net >= settings.freeShippingThreshold;
  const shippingFee = (items.length === 0 || isFree) ? 0 : settings.standardShippingFee;
  const finalTotal = items.length === 0 ? 0 : Math.max(0, net + shippingFee);

  return {
    itemsCount,
    subtotal,
    originalSubtotal,
    dealSavings,
    couponDiscount,
    shippingFee,
    finalTotal,
    isFreeShipping: isFree,
  };
}

describe('Single Source of Truth Pricing Module & Parity Test', () => {
  const sampleProduct: Product = {
    id: 'cv-watch-01',
    name: 'Calenvee Obsidian Chrono Edition',
    slug: 'calenvee-obsidian-chrono-edition',
    category: 'watches',
    categoryLabel: 'Timepieces',
    price: 8499,
    originalPrice: 12999,
    discountPercentage: 35,
    rating: 5,
    reviewsCount: 120,
    inStock: true,
    stockCount: 45,
    tags: ['watches', 'luxury'],
    images: ['/products/watch-1.jpg'],
    description: 'Sample description',
    shortDescription: 'Sample short description',
    specifications: {},
    colors: [{ name: 'Obsidian Black', hex: '#111111', inStock: true }],
    reviews: [],
  };

  const sampleDeals: Deal[] = [
    {
      id: 'deal-active',
      productId: 'cv-watch-01',
      badge: 'Flash Deal',
      title: 'Obsidian Chrono Special',
      dealPrice: 5999,
      startDateTime: '2026-10-15T00:00:00+05:00',
      endDateTime: '2026-10-31T23:59:59+05:00',
      active: true,
    },
    {
      id: 'deal-expired',
      productId: 'cv-jewel-01',
      badge: 'Expired Deal',
      title: 'Old Cuban Chain Deal',
      dealPrice: 2499,
      startDateTime: '2026-09-01T00:00:00+05:00',
      endDateTime: '2026-09-10T23:59:59+05:00',
      active: true,
    },
  ];

  const samplePromo: PromoCode = {
    code: 'CALENVEE10',
    discountPercentage: 10,
    minOrderValue: 1000,
    description: '10% Welcome Discount',
  };

  const shippingSettings = {
    freeShippingThreshold: 3500,
    standardShippingFee: 250,
  };

  it('correctly evaluates active deals in Asia/Karachi (UTC+5)', () => {
    // 2026-10-16 12:00:00 PKT (within active window)
    const testNow = '2026-10-16T12:00:00+05:00';
    const nowMs = normalizeNowMs(testNow);

    const clientRes = getEffectivePrice(sampleProduct, testNow, sampleDeals);
    const serverRes = calculateEffectivePriceServer(sampleProduct, nowMs, sampleDeals);

    expect(clientRes.isDealActive).toBe(true);
    expect(clientRes.effectivePrice).toBe(5999);
    expect(clientRes.appliedDeal?.id).toBe('deal-active');

    // Assert exact parity with server
    expect(clientRes.effectivePrice).toBe(serverRes.effectivePrice);
    expect(clientRes.originalPrice).toBe(serverRes.originalPrice);
    expect(clientRes.discountAmount).toBe(serverRes.discountAmount);
    expect(clientRes.discountPercentage).toBe(serverRes.discountPercentage);
    expect(clientRes.isDealActive).toBe(serverRes.isDealActive);
  });

  it('reverts to catalog price when deal is expired', () => {
    // 2026-11-05 10:00:00 PKT (after deal ended)
    const testNow = '2026-11-05T10:00:00+05:00';
    const nowMs = normalizeNowMs(testNow);

    const clientRes = getEffectivePrice(sampleProduct, testNow, sampleDeals);
    const serverRes = calculateEffectivePriceServer(sampleProduct, nowMs, sampleDeals);

    expect(clientRes.isDealActive).toBe(false);
    expect(clientRes.effectivePrice).toBe(8499);
    expect(clientRes.appliedDeal).toBeNull();

    // Assert exact parity with server
    expect(clientRes.effectivePrice).toBe(serverRes.effectivePrice);
    expect(clientRes.originalPrice).toBe(serverRes.originalPrice);
  });

  it('computes identical cart totals between frontend and server implementations across coupons and shipping', () => {
    const testNow = '2026-10-16T12:00:00+05:00';
    const nowMs = normalizeNowMs(testNow);

    const cartItems: CartItem[] = [
      {
        id: 'cart-1',
        product: sampleProduct, // 5999 deal price
        quantity: 1,
        selectedColor: sampleProduct.colors[0],
      },
      {
        id: 'cart-2',
        product: {
          ...sampleProduct,
          id: 'cv-other-02',
          price: 2000,
          originalPrice: 3000,
        },
        quantity: 2, // 2 * 2000 = 4000
        selectedColor: sampleProduct.colors[0],
      },
    ];

    // Subtotal: 5999 + 4000 = 9999
    // Coupon CALENVEE10 (10%): 9999 * 0.1 = 1000 (rounded)
    // Net: 9999 - 1000 = 8999 >= 3500 threshold -> Shipping: 0 (FREE)
    // Final Total: 8999

    const clientTotals = calculateCartTotals(cartItems, testNow, sampleDeals, samplePromo, shippingSettings);
    const serverTotals = calculateOrderTotalsServer(cartItems, nowMs, sampleDeals, samplePromo, shippingSettings);

    expect(clientTotals.subtotal).toBe(9999);
    expect(clientTotals.couponDiscount).toBe(1000);
    expect(clientTotals.shippingFee).toBe(0);
    expect(clientTotals.finalTotal).toBe(8999);
    expect(clientTotals.isFreeShipping).toBe(true);

    // Assert exact 100% parity with server
    expect(clientTotals.subtotal).toBe(serverTotals.subtotal);
    expect(clientTotals.couponDiscount).toBe(serverTotals.couponDiscount);
    expect(clientTotals.shippingFee).toBe(serverTotals.shippingFee);
    expect(clientTotals.finalTotal).toBe(serverTotals.finalTotal);
    expect(clientTotals.dealSavings).toBe(serverTotals.dealSavings);
    expect(clientTotals.isFreeShipping).toBe(serverTotals.isFreeShipping);
  });

  it('applies standard delivery fee when cart total is below free shipping threshold', () => {
    const testNow = '2026-10-16T12:00:00+05:00';
    const nowMs = normalizeNowMs(testNow);

    const smallCart: CartItem[] = [
      {
        id: 'cart-small',
        product: {
          ...sampleProduct,
          id: 'cv-small-item',
          price: 1500,
          originalPrice: 2000,
        },
        quantity: 1,
        selectedColor: sampleProduct.colors[0],
      },
    ];

    // Subtotal: 1500
    // Coupon 10%: 150
    // Net: 1350 < 3500 threshold -> Shipping: 250
    // Final Total: 1350 + 250 = 1600

    const clientTotals = calculateCartTotals(smallCart, testNow, sampleDeals, samplePromo, shippingSettings);
    const serverTotals = calculateOrderTotalsServer(smallCart, nowMs, sampleDeals, samplePromo, shippingSettings);

    expect(clientTotals.subtotal).toBe(1500);
    expect(clientTotals.couponDiscount).toBe(150);
    expect(clientTotals.shippingFee).toBe(250);
    expect(clientTotals.finalTotal).toBe(1600);
    expect(clientTotals.isFreeShipping).toBe(false);
    expect(clientTotals.amountUntilFreeShipping).toBe(3500 - 1350);

    // Parity with server
    expect(clientTotals.subtotal).toBe(serverTotals.subtotal);
    expect(clientTotals.couponDiscount).toBe(serverTotals.couponDiscount);
    expect(clientTotals.shippingFee).toBe(serverTotals.shippingFee);
    expect(clientTotals.finalTotal).toBe(serverTotals.finalTotal);
    expect(clientTotals.isFreeShipping).toBe(serverTotals.isFreeShipping);
  });
});

