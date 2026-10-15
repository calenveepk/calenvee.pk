import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Clock, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../data/products';
import { formatPKR } from '../../utils/formatters';
import homeContentData from '../../data/homeContent.json';

export const DiscountOfferBanner: React.FC = () => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const dealConfig = homeContentData.trioBanners?.dealOfTheDay || {
    badge: 'Deal of the Day',
    title: 'Up to 60% Off',
    productId: 'cv-watch-01',
    link: '/product/calenvee-obsidian-chrono-edition',
    ctaText: 'Shop Deals',
  };

  // Find top product or fallback to first
  const dealProduct = PRODUCTS.find((p) => p.id === dealConfig.productId) || PRODUCTS[0];

  // Live countdown timer state (cycling 8 hours)
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds -= 1;
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }
        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }
        if (hours < 0) {
          hours = 8;
          minutes = 0;
          seconds = 0;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleQuickAdd = () => {
    if (dealProduct) {
      addItem(dealProduct, dealProduct.colors?.[0] || { name: 'Obsidian Black', hex: '#111111', inStock: true });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const originalPrice = dealProduct.originalPrice || Math.round(dealProduct.price * 1.6);
  const discountPercent = Math.round(((originalPrice - dealProduct.price) / originalPrice) * 100);

  return (
    <section className="bg-white py-5 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFF7F0] via-[#FFFBF7] to-[#FED7AA]/35 border border-orange-200/90 p-4 sm:p-8 shadow-sm overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Heading, Badge, & Urgency Timer (5 cols) */}
            <div className="md:col-span-5 space-y-3 sm:space-y-4 text-left">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-100/90 text-[11px] font-extrabold text-[#EA580C] uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-[#EA580C] animate-pulse" />
                <span>{dealConfig.badge}</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B132B] tracking-tight leading-tight">
                  {dealConfig.title} Flash Drop
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Special discount on top-selling luxury pieces. Limited daily inventory.
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
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">HRS</span>
                  </div>
                  <span className="font-bold text-gray-400">:</span>
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-200 shadow-2xs text-center min-w-[44px]">
                    <span className="block text-sm sm:text-base font-black text-[#0B132B] font-mono leading-none">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">MIN</span>
                  </div>
                  <span className="font-bold text-gray-400">:</span>
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-orange-200 shadow-2xs text-center min-w-[44px]">
                    <span className="block text-sm sm:text-base font-black text-[#EA580C] font-mono leading-none">
                      {String(timeLeft.seconds).padStart(2, '0')}
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
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs tracking-wider transition-all shadow-md active:scale-95 ${
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

            {/* Right Column: Pricing, Scarcity, Stock Meter (3 cols) */}
            <div className="md:col-span-3 bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-orange-200/70 shadow-2xs space-y-3 text-left">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Featured Product
                </span>
                <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2">
                  {dealProduct.name}
                </h4>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl sm:text-2xl font-black text-[#EA580C]">
                    {formatPKR(dealProduct.price)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatPKR(originalPrice)}
                  </span>
                </div>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Save {discountPercent}% Instant Off
                </span>
              </div>

              {/* Scarcity Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-gray-600">Stock Status:</span>
                  <span className="font-bold text-[#EA580C]">Only 14 left</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-full"
                    style={{ width: '82%' }}
                  />
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

