import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Gift } from 'lucide-react';

export const SpecialOfferBanner: React.FC = () => {
  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-[#0A192F] overflow-hidden text-white p-6 sm:p-10 lg:p-12 shadow-xl">
          
          {/* Subtle background radial glow */}
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#F97316]/10 blur-3xl pointer-events-none" />
          <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Left: 3D Gift Box / Visual (Matching Reference Image) */}
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-[#0F274E] to-[#1E3A8A] border border-blue-400/20 shadow-2xl flex items-center justify-center relative flex-shrink-0">
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  %
                </div>
                <Gift className="w-12 h-12 sm:w-16 sm:h-16 text-[#F97316]" />
              </div>

              {/* Center Content: Headline & Subtitle */}
              <div className="space-y-1.5 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  UP TO 40% OFF
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 font-light">
                  Limited time offer on selected university & daily lifestyle items across Pakistan.
                </p>
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="flex-shrink-0">
              <Link
                to="/shop"
                className="inline-flex items-center px-6 sm:px-8 py-3.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all duration-200 group"
              >
                <span>SHOP THE SALE</span>
                <ChevronRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

