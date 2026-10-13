import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, ShieldCheck, Truck, ArrowRight, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      {/* Container matching reference design: Forest Green rounded card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0A2619] via-[#0D2E1E] to-[#081F14] overflow-hidden shadow-2xl border border-emerald-950/60 p-6 sm:p-10 lg:p-14">
        
        {/* Subtle decorative dot grid pattern on top right */}
        <div 
          className="absolute -top-10 -right-10 w-96 h-96 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#34D399 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px'
          }}
        />

        {/* Ambient soft glow */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-[#10B981]/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Headline, Trust Points, and Call to Action (6 cols) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIMITED TIME ONLY</span>
            </div>

            {/* Main Title matching reference typography */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Shop More,<br />
                <span className="text-[#F97316]">Save More!</span>
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/80 font-normal max-w-md pt-2 leading-relaxed">
                Discover amazing deals on your favorite lifestyle products, timepieces, luxury handbags, and modern essentials.
              </p>
            </div>

            {/* 3 Trust Badges Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 border-t border-emerald-800/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-white">
                <div className="w-7 h-7 rounded-lg bg-emerald-800/60 flex items-center justify-center flex-shrink-0 text-emerald-300 border border-emerald-600/30">
                  <Tag className="w-3.5 h-3.5 text-[#F97316]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">Best Prices</div>
                  <div className="text-[10px] text-emerald-300/70">Guaranteed</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-white">
                <div className="w-7 h-7 rounded-lg bg-emerald-800/60 flex items-center justify-center flex-shrink-0 text-emerald-300 border border-emerald-600/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">Secure</div>
                  <div className="text-[10px] text-emerald-300/70">Payments & COD</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-white">
                <div className="w-7 h-7 rounded-lg bg-emerald-800/60 flex items-center justify-center flex-shrink-0 text-emerald-300 border border-emerald-600/30">
                  <Truck className="w-3.5 h-3.5 text-[#F97316]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">Fast Delivery</div>
                  <div className="text-[10px] text-emerald-300/70">Nationwide</div>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2.5 px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl hover:shadow-orange-500/25 transition-all duration-200 active:scale-95 group"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Podium Staging Composition + Floating Badge (6 cols) */}
          <div className="lg:col-span-6 relative flex justify-center items-center mt-4 lg:mt-0">
            
            {/* Circular Floating Badge matching reference: UP TO 50% OFF */}
            <div className="absolute top-2 sm:top-4 right-4 sm:right-10 z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB923C] text-white flex flex-col items-center justify-center font-black shadow-2xl border-2 border-white/20 transform hover:scale-105 transition-transform duration-200">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-orange-100">UP TO</span>
              <span className="text-xl sm:text-2xl font-black leading-none">50%</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider text-orange-100">OFF</span>
            </div>

            {/* High-Resolution Staged Podium Photo */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="/hero/hero_podium_collection.jpg"
                alt="Calenvee Luxury Collection"
                className="w-full h-auto max-h-[460px] object-cover object-center transform transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
