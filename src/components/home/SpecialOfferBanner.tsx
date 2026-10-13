import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../data/products';
import { formatPKR } from '../../utils/formatters';

export const SpecialOfferBanner: React.FC = () => {
  const { addItem, setIsOpen: setIsCartOpen } = useCart();

  // Find the deal product or use default
  const dealProduct = PRODUCTS.find((p) => p.id === 'cv-deal-smartwatch') || PRODUCTS[0];

  // Live Countdown Timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 12,
    seconds: 45,
    msecs: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let msecs = prev.msecs - 1;
        let seconds = prev.seconds;
        let minutes = prev.minutes;
        let hours = prev.hours;

        if (msecs < 0) {
          msecs = 99;
          seconds -= 1;
        }
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }
        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }
        if (hours < 0) {
          // Reset to 8 hours for infinite loop
          hours = 8;
          minutes = 0;
          seconds = 0;
          msecs = 0;
        }

        return { hours, minutes, seconds, msecs };
      });
    }, 10);

    return () => clearInterval(timer);
  }, []);

  const handleQuickAddDeal = () => {
    if (dealProduct) {
      addItem(dealProduct, dealProduct.colors?.[0] || { name: 'Standard Edition', hex: '#111111', inStock: true });
      setIsCartOpen(true);
    }
  };

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Deal of the Day Card matching reference design */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FFF5ED] via-[#FFF8F2] to-[#FFEDE0] border border-[#FED7AA] p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Deal Heading & CTA (4 cols) */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-5 text-left">
              
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                <Flame className="w-4 h-4 text-[#EA580C]" />
                <span>DEAL OF THE DAY</span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0B132B] tracking-tight leading-tight">
                  Grab It Before<br />
                  It's Gone!
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-normal">
                  Hurry! Limited stock available for today's flash drop.
                </p>
              </div>

              <div>
                <button
                  onClick={handleQuickAddDeal}
                  className="inline-flex items-center space-x-2 px-7 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all duration-200 active:scale-95 group"
                >
                  <span>SHOP THE DEAL</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

            </div>

            {/* Center Column: Cutout Product Photo (4 cols) */}
            <div className="lg:col-span-4 flex justify-center items-center py-2">
              <div className="relative group max-w-[240px] sm:max-w-[280px]">
                <div className="absolute inset-0 bg-orange-400/10 rounded-full blur-2xl transform scale-90" />
                <img
                  src="/hero/hero-watch.png"
                  alt="Smart Watch Pro"
                  className="relative z-10 w-full h-auto max-h-64 object-contain filter drop-shadow-xl transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Right Column: Product Info, Scarcity Bar, and Live Timer (4 cols) */}
            <div className="lg:col-span-4 space-y-5 text-left bg-white/70 backdrop-blur-xs p-6 rounded-2xl border border-orange-200/60 shadow-2xs">
              
              {/* Product Info & Pricing */}
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  Smart Watch Pro
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Fitness &amp; Health Tracking • Sapphire Crystal
                </p>

                <div className="mt-2.5 flex items-baseline space-x-2.5">
                  <span className="text-xl sm:text-2xl font-black text-[#EA580C]">
                    {formatPKR(4999)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatPKR(8999)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Save 44%
                  </span>
                </div>
              </div>

              {/* Scarcity Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Only 23 items left!</span>
                  <span className="font-bold text-[#EA580C] text-[11px]">78% Claimed</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-full transition-all duration-500"
                    style={{ width: '78%' }}
                  />
                </div>
              </div>

              {/* Real-Time Live Countdown Timer matching reference */}
              <div className="pt-2 border-t border-orange-100">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white rounded-xl py-2 px-1 border border-orange-200/80 shadow-2xs">
                    <span className="block text-sm sm:text-base font-black text-gray-900 font-mono">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="block text-[9px] font-semibold text-gray-400 uppercase">HRS</span>
                  </div>

                  <div className="bg-white rounded-xl py-2 px-1 border border-orange-200/80 shadow-2xs">
                    <span className="block text-sm sm:text-base font-black text-gray-900 font-mono">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="block text-[9px] font-semibold text-gray-400 uppercase">MINS</span>
                  </div>

                  <div className="bg-white rounded-xl py-2 px-1 border border-orange-200/80 shadow-2xs">
                    <span className="block text-sm sm:text-base font-black text-gray-900 font-mono">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="block text-[9px] font-semibold text-gray-400 uppercase">SECS</span>
                  </div>

                  <div className="bg-white rounded-xl py-2 px-1 border border-orange-200/80 shadow-2xs">
                    <span className="block text-sm sm:text-base font-black text-[#EA580C] font-mono">
                      {String(timeLeft.msecs).padStart(2, '0')}
                    </span>
                    <span className="block text-[9px] font-semibold text-gray-400 uppercase">MSEC</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
