import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      {/* Full-Bleed Integrated Hero Card */}
      <div className="relative rounded-3xl bg-[#0A2619] overflow-hidden shadow-2xl border border-emerald-950/60 min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] flex items-center">
        
        {/* Full-bleed background image anchored to the right */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero/hero_podium_collection.jpg"
            alt="Calenvee Luxury Collection"
            className="w-full h-full object-cover object-[75%_center] sm:object-[80%_center] lg:object-right"
          />

          {/* Dark Forest Green Gradient Fade Overlay:
              Solid deep green on the left for maximum text sharpness,
              seamlessly fading toward transparent on the right to showcase the product podium. */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2619] via-[#0A2619]/90 md:via-[#0A2619]/75 to-transparent pointer-events-none" />

          {/* Mobile vertical gradient for flawless text readability on small displays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2619] via-[#0A2619]/70 to-transparent sm:hidden pointer-events-none" />
        </div>

        {/* Subtle decorative dot grid on top right */}
        <div 
          className="absolute -top-10 -right-10 w-96 h-96 opacity-15 pointer-events-none z-1"
          style={{
            backgroundImage: 'radial-gradient(#34D399 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px'
          }}
        />

        {/* Circular Floating Badge matching reference: UP TO 50% OFF */}
        <div className="absolute top-4 sm:top-8 right-4 sm:right-10 z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#F97316] to-[#FB923C] text-white flex flex-col items-center justify-center font-black shadow-2xl border-2 border-white/20 transform hover:scale-105 transition-transform duration-200">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-orange-100">UP TO</span>
          <span className="text-xl sm:text-2xl font-black leading-none">50%</span>
          <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider text-orange-100">OFF</span>
        </div>

        {/* Left Content Area: Headline, Subtitle, and Call to Action */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-16 max-w-xl lg:max-w-2xl space-y-5 sm:space-y-6 text-left">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIMITED TIME ONLY</span>
          </div>

          {/* Main Title matching reference typography */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
              Shop More,<br />
              <span className="text-[#F97316]">Save More!</span>
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 font-normal max-w-lg pt-1 leading-relaxed">
              Discover amazing deals on your favorite lifestyle products, timepieces, luxury handbags, and modern essentials across Pakistan.
            </p>
          </div>

          {/* Primary Action Button & Slogan */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2.5 px-8 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl hover:shadow-orange-500/30 transition-all duration-200 active:scale-95 group"
            >
              <span>EXPLORE COLLECTION</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <span className="text-xs font-mono font-semibold tracking-wider text-emerald-300/80 uppercase">
              SHOP SMART, LIVE BETTER
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
