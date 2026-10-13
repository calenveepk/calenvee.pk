import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-4 sm:pb-6">
      {/* Full-Bleed Integrated Hero Card */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-[#0A2619] overflow-hidden shadow-2xl border border-emerald-950/60 min-h-[300px] sm:min-h-[440px] lg:min-h-[500px] flex items-center">
        
        {/* Full-bleed background image anchored to the right — clearly visible on mobile & desktop */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero/hero_podium_collection.jpg"
            alt="Calenvee Luxury Collection"
            className="w-full h-full object-cover object-[82%_center] sm:object-[80%_center] lg:object-right"
          />

          {/* Dark Forest Green Gradient Fade Overlay:
              Solid deep green on the left where the text sits,
              fading smoothly to transparent on the right so the products on the podium are completely clear. */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2619] via-[#0A2619]/85 sm:via-[#0A2619]/75 to-transparent pointer-events-none" />
        </div>

        {/* Subtle decorative dot grid on top right */}
        <div 
          className="absolute -top-10 -right-10 w-64 sm:w-96 h-64 sm:h-96 opacity-15 pointer-events-none z-1"
          style={{
            backgroundImage: 'radial-gradient(#34D399 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px'
          }}
        />

        {/* Circular Floating Badge matching reference: UP TO 50% OFF */}
        <div className="absolute top-3 sm:top-6 lg:top-8 right-3 sm:right-6 lg:right-10 z-20 w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB923C] text-white flex flex-col items-center justify-center font-black shadow-xl border-2 border-white/20 transform hover:scale-105 transition-transform duration-200">
          <span className="text-[7px] sm:text-[9px] lg:text-[10px] uppercase font-bold tracking-wider text-orange-100">UP TO</span>
          <span className="text-sm sm:text-xl lg:text-2xl font-black leading-none">50%</span>
          <span className="text-[7px] sm:text-[9px] lg:text-[10px] uppercase font-extrabold tracking-wider text-orange-100">OFF</span>
        </div>

        {/* Left Content Area: Headline, Subtitle, and Call to Action */}
        {/* Confined to the left (max-w-[58%] on mobile) so it never covers the product image on the right */}
        <div className="relative z-10 p-4 sm:p-8 lg:p-14 max-w-[58%] sm:max-w-md lg:max-w-xl space-y-2.5 sm:space-y-4 lg:space-y-5 text-left flex flex-col items-start">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-[9px] sm:text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIMITED TIME ONLY</span>
          </div>

          {/* Main Title matching reference typography */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
              Shop More,<br />
              <span className="text-[#F97316]">Save More!</span>
            </h1>
            <p className="text-[11px] sm:text-sm text-emerald-100/90 font-normal leading-relaxed pt-0.5 line-clamp-2 sm:line-clamp-none">
              Discover amazing deals on your favorite lifestyle products, timepieces, luxury handbags, and modern essentials across Pakistan.
            </p>
          </div>

          {/* Primary Action Button & Slogan */}
          <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 px-4 py-2.5 sm:px-8 sm:py-3.5 lg:py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-[11px] sm:text-xs lg:text-sm uppercase tracking-wider rounded-lg sm:rounded-xl shadow-xl hover:shadow-orange-500/30 transition-all duration-200 active:scale-95 group"
            >
              <span>EXPLORE COLLECTION</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <span className="text-[9px] sm:text-xs font-mono font-semibold tracking-wider text-emerald-300/80 uppercase">
              SHOP SMART, LIVE BETTER
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
