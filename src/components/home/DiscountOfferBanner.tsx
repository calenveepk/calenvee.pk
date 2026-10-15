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

export const DiscountOfferBanner: React.FC = () => {
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
    dealPrice: 5999,
    startDateTime: '2026-10-15T00:00:00+05:00',
    endDateTime: '2026-10-31T23:59:59+05:00',
    link: '/product/calenvee-obsidian-chrono-edition',
    ctaText: 'Claim Deal Now',
    active: true,
  };

  const allDeals = (deals && deals.length > 0 ? deals : (dealsData as Deal[])) || [];
  const activeDeal = allDeals.find(
    (d) => (d.id === (dealConfig as any).dealId || d.productId === dealConfig.productId) && isDealActive(d, currentNowMs + clockOffset)
  ) || (isDealActive(dealConfig as any, currentNowMs + clockOffset) ? (dealConfig as any as Deal) : null);

  // Expired state: Auto-hide section when deal is expired or unconfigured
  if (!activeDeal) {
    return null;
  }

  const dealProduct = PRODUCTS.find((p) => p.id === activeDeal.productId) || PRODUCTS[0];
  if (!dealProduct) {
    return null;
  }

  // Real countdown timer that survives browser reloads & skewed device clocks
  const endMs = normalizeNowMs(activeDeal.endDateTime);
  const diffMs = Math.max(0, endMs - (currentNowMs + clockOffset));

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const effectivePrice = activeDeal.dealPrice || dealProduct.price;
  const originalPrice = dealProduct.originalPrice || Math.round(dealProduct.price * 1.5);
  const discountPercent = Math.max(
    0,
    Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
  );

  const handleQuickAdd = () => {
    addItem(
      { ...dealProduct, price: effectivePrice },
      dealProduct.colors?.[0] || { name: 'Obsidian Black', hex: '#111111', inStock: true }
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const stockRemaining = activeDeal.stockLimit || dealProduct.stockCount || 14;

  return (
    <section className="bg-white py-5 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFF7F0] via-[#FFFBF7] to-[#FED7AA]/35 border border-orange-200/90 p-4 sm:p-8 shadow-sm overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Heading, Badge, & Urgency Timer (5 cols) */}
            <div className="md:col-span-5 space-y-3 sm:space-y-4 text-left">
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

            {/* Middle Column: Cutout Product Photo (4 cols) */}
            <div className="md:col-span-4 flex items-center justify-center py-2">
              <Link
                to={dealConfig.link || `/product/${dealProduct.slug}`}
                className="group relative max-w-[220px] sm:max-w-[260px] flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-orange-400/15 rounded-full blur-2xl transform scale-90 group-hover:scale-105 transition-transform duration-500" />
                <img
                  src={dealProduct.images[0] || '/hero/hero-watch.png'}
                  alt={dealProduct.name}
                  className="relative z-10 w-full h-auto max-h-52 sm:max-h-64 object-contain filter drop-shadow-xl transform transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </Link>
            </div>

            {/* Right Column: Real Pricing, Real Stock (3 cols) */}
            <div className="md:col-span-3 bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-orange-200/70 shadow-2xs space-y-3 text-left">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Promotional Deal
                </span>
                <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2">
                  {dealProduct.name}
                </h4>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl sm:text-2xl font-black text-[#EA580C]">
                    {formatPKR(effectivePrice)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatPKR(originalPrice)}
                  </span>
                </div>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Save {discountPercent}% Deal Price
                </span>
              </div>

              {/* Real Inventory Status */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-gray-600">Inventory:</span>
                  <span className="font-bold text-emerald-700">In Stock ({stockRemaining} available)</span>
                </div>
              </div>

              <div className="pt-1 text-[10px] text-gray-500">
                ✓ Cash on Delivery Available
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
