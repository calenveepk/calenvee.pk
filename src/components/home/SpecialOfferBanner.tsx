import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Gift } from 'lucide-react';
import { STORE_SALE_OFFER } from '../../data/promotions';

export const SpecialOfferBanner: React.FC = () => {
  if (!STORE_SALE_OFFER.active) return null;

  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-[#0A192F] overflow-hidden text-white p-7 sm:p-10 lg:p-12 shadow-xl text-center">
          
          <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4">
            
            {/* Centered Gift Box Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#0F274E] to-[#1E3A8A] border border-blue-400/20 shadow-xl flex items-center justify-center relative flex-shrink-0">
              <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-[#F97316] flex items-center justify-center text-white text-xs font-bold shadow-md">
                {STORE_SALE_OFFER.badgeText}
              </div>
              <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-[#F97316]" />
            </div>

            {/* Centered Headline & Subtitle */}
            <div className="space-y-1.5 text-center">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {STORE_SALE_OFFER.headline}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 font-light max-w-lg mx-auto leading-relaxed">
                {STORE_SALE_OFFER.subheading}
              </p>
            </div>

            {/* Centered CTA Button */}
            <div className="pt-2">
              <Link
                to={STORE_SALE_OFFER.ctaLink}
                className="inline-flex items-center px-7 sm:px-8 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all duration-200 group active:scale-98"
              >
                <span>{STORE_SALE_OFFER.ctaText}</span>
                <ChevronRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
