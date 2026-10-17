import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Clock, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../data/products';
import { formatPKR } from '../../utils/formatters';
import { isDealActive, normalizeNowMs } from '../../utils/pricing';
import homeContentData from '../../data/homeContent.json';
import dealsData from '../../data/deals.json';
import { Deal } from '../../types';

export interface DiscountOfferBannerProps {
  settings?: {
    dealId?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    autoHideWhenExpired?: boolean;
    discountPercentage?: number;
    endDateTime?: string;
    dealPrice?: number;
  };
}

export const DiscountOfferBanner: React.FC<DiscountOfferBannerProps> = ({ settings }) => {
  const { addItem, deals } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [clockOffset, setClockOffset] = useState(0);
  const [currentNowMs, setCurrentNowMs] = useState(Date.now());

  // Check server clock offset on mount to correct for skewed client device clocks
  useEffect(() => {
    try {
      fetch(window.location.origin, { method: 'HEAD' })
        .then((res) => {
          const serverDateStr = res.headers.get('date');
          if (serverDateStr) {
            const serverMs = Date.parse(serverDateStr);
            if (!isNaN(serverMs)) {
              setClockOffset(serverMs - Date.now());
            }
          }
        })
        .catch(() => {});
    } catch (_) {}
  }, []);

  const dealConfig = homeContentData.trioBanners?.dealOfTheDay || {
    badge: 'Deal of the Day',
    title: 'Obsidian Chronograph Flash Drop',
    dealId: 'deal-obsidian-chrono',
    productId: 'cv-watch-01',
    dealPrice: 3899,
    discountPercentage: 35,
    startDateTime: '2026-10-15T00:00:00+05:00',
    endDateTime: '2026-10-31T23:59:59+05:00',
    link: '/product/calenvee-obsidian-chrono-edition',
    ctaText: 'Claim Deal Now',
    active: true,
  };

  const allDeals = (deals && deals.length > 0 ? deals : (dealsData as Deal[])) || [];
  const targetDealId = settings?.dealId || (dealConfig as any).dealId || 'deal-obsidian-chrono';
  const matchedDeal = allDeals.find(
    (d) => d.id === targetDealId || d.productId === dealConfig.productId
  ) || (dealConfig as any as Deal);

  const activeDeal: Deal = {
    ...matchedDeal,
    endDateTime: settings?.endDateTime || matchedDeal.endDateTime,
    discountPercentage: settings?.discountPercentage !== undefined ? settings.discountPercentage : matchedDeal.discountPercentage,
    dealPrice: settings?.dealPrice !== undefined ? settings.dealPrice : matchedDeal.dealPrice,
  };

  // Real countdown timer that survives browser reloads & skewed device clocks
  const endMs = normalizeNowMs(activeDeal.endDateTime);
  const diffMs = Math.max(0, endMs - (currentNowMs + clockOffset));

  // Expired state: Auto-hide section when deal is expired or unconfigured
  const isDealExpired = diffMs <= 0;
  if (!isDealActive(activeDeal, currentNowMs + clockOffset) || isDealExpired) {
    if (settings?.autoHideWhenExpired !== false) {
      return null;
    }
  }

  const dealProduct = PRODUCTS.find((p) => p.id === activeDeal.productId) || PRODUCTS[0];
  if (!dealProduct) {
    return null;
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const originalPrice = dealProduct.originalPrice || Math.round(dealProduct.price * 1.5);
  let discountPercent = activeDeal.discountPercentage;
  let effectivePrice = activeDeal.dealPrice;

  if (discountPercent !== undefined && discountPercent > 0) {
    effectivePrice = Math.round(originalPrice * (1 - discountPercent / 100));
  } else if (effectivePrice && effectivePrice > 0) {
    discountPercent = Math.max(0, Math.round(((originalPrice - effectivePrice) / originalPrice) * 100));
  } else {
    effectivePrice = dealProduct.price;
    discountPercent = 0;
  }

  const handleQuickAdd = () => {
    addItem(
      { ...dealProduct, price: effectivePrice },
      dealProduct.colors?.[0] || { name: 'Obsidian Black', hex: '#111111', inStock: true }
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <section className="bg-white py-5 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFF7F0] via-[#FFFBF7] to-[#FED7AA]/35 border border-orange-200/90 p-4 sm:p-8 shadow-sm overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Heading, Badge, Pricing, Timer & CTA (7 cols) */}
            <div className="md:col-span-7 space-y-3 sm:space-y-4 text-left">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-100/90 text-[11px] font-extrabold text-[#EA580C] uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-[#EA580C] animate-pulse" />
                <span>{activeDeal.badge || 'Deal of the Day'}</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B132B] tracking-tight leading-tight">
                  {activeDeal.title || dealConfig.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Special verified promotional price on our flagship timepiece. Evaluated in Pakistan Time (PKT).
                </p>
              </div>

              {/* Deal Pricing */}
              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#EA580C]">
                  {formatPKR(effectivePrice)}
                </span>
                <span className="text-sm sm:text-base text-gray-400 line-through">
                  {formatPKR(originalPrice)}
                </span>
                <span className="inline-block text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Save {discountPercent}% OFF
                </span>
              </div>

              {/* Countdown Urgency Block */}
              <div className="pt-1">
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-gray-500 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Offer ends in:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-200 shadow-2xs text-center min-w-[44px]">
                    <span className="block text-sm sm:text-base font-black text-[#0B132B] font-mono leading-none">
                      {String(hours).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">HRS</span>
                  </div>
                  <span className="font-bold text-gray-400">:</span>
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-200 shadow-2xs text-center min-w-[44px]">
                    <span className="block text-sm sm:text-base font-black text-[#0B132B] font-mono leading-none">
                      {String(minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">MIN</span>
                  </div>
                  <span className="font-bold text-gray-400">:</span>
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-200 shadow-2xs text-center min-w-[44px]">
                    <span className="block text-sm sm:text-base font-black text-[#EA580C] font-mono leading-none">
                      {String(seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">SEC</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#F97316] hover:bg-[#EA580C] text-white hover:shadow-orange-500/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>ADDED TO BAG!</span>
                    </>
                  ) : (
                    <>
                      <span>CLAIM DEAL NOW</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <Link
                  to={dealConfig.link || `/product/${dealProduct.slug}`}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-gray-700 hover:text-black bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>

            {/* Right Column: Featured Product Photo (5 cols) without blur-2xl artifact */}
            <div className="md:col-span-5 flex items-center justify-center py-2">
              <Link
                to={dealConfig.link || `/product/${dealProduct.slug}`}
                className="group relative max-w-[240px] sm:max-w-[280px] w-full flex items-center justify-center"
              >
                <div className="absolute inset-0 rounded-2xl bg-orange-200/30 transform scale-95 pointer-events-none transition-transform duration-500 group-hover:scale-100" />
                <img
                  src={dealProduct.images[0] || '/hero/hero-watch.png'}
                  alt={dealProduct.name}
                  className="relative z-10 w-full h-52 sm:h-64 object-cover rounded-2xl border border-orange-200/80 shadow-md transform transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
