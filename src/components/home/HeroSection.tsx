import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, Truck } from 'lucide-react';
import homeContentData from '../../data/homeContent.json';

export const HeroSection: React.FC = () => {
  const hero = homeContentData.hero || {
    kicker: 'QUALITY. STYLE. EVERYDAY.',
    headlinePrefix: 'Everything You Love,',
    headlineHighlight: 'All in One Place.',
    subtitle: 'Shop top-quality products across watches, jewelry, handbags, sunglasses, and fragrances with unbeatable prices and a seamless Cash on Delivery experience nationwide.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    trustPoints: [
      { text: 'Cash on Delivery' },
      { text: 'Premium Quality' },
      { text: 'Nationwide Shipping' },
    ],
    image: '/hero/hero_podium_collection.jpg',
  };

  return (
    <section className="relative w-full bg-[#FAF7F2] border-b border-gray-100 overflow-hidden">
      
      {/* 1. Full-Bleed Integrated Product Visual (Anchored to Right Edge of Screen) */}
      <div className="absolute top-0 right-0 bottom-0 w-[50%] sm:w-[52%] lg:w-[55%] h-full overflow-hidden pointer-events-none z-0">
        <img
          src={hero.image || '/hero/hero_podium_collection.jpg'}
          alt="Calenvee Luxury Lifestyle Collection"
          className="w-full h-full object-cover object-[60%_center] sm:object-center transform transition-transform duration-700 hover:scale-102"
          loading="eager"
        />
        
        {/* Seamless Soft Blend Gradient (fades left edge of image into background) */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-28 lg:w-40 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/85 to-transparent pointer-events-none" />
        
        {/* Soft top & bottom edge blending */}
        <div className="absolute inset-x-0 top-0 h-6 sm:h-12 bg-gradient-to-b from-[#FAF7F2]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-6 sm:h-12 bg-gradient-to-t from-[#FAF7F2]/50 to-transparent pointer-events-none" />
      </div>

      {/* 2. Content Container (Wide horizontal layout on mobile with right image breathing room) */}
      <div className="relative z-10 max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-18 min-h-[320px] sm:min-h-[420px] lg:min-h-[500px] flex items-center">
        <div className="w-[66%] sm:w-[56%] lg:max-w-xl space-y-2 sm:space-y-5 text-left">
          
          {/* Kicker Pill */}
          <div className="inline-flex items-center space-x-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#F97316]">
            <span>{hero.kicker}</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-4xl lg:text-5xl font-black text-[#0B132B] tracking-tight leading-[1.12]">
              {hero.headlinePrefix}<br />
              <span className="text-[#F97316]">{hero.headlineHighlight}</span>
            </h1>
            <p className="text-[11px] sm:text-xs lg:text-sm text-gray-600 font-normal leading-relaxed line-clamp-2 sm:line-clamp-none max-w-sm sm:max-w-md">
              {hero.subtitle}
            </p>
          </div>

          {/* Shop Now CTA Button */}
          <div className="pt-0.5 sm:pt-1.5">
            <Link
              to={hero.ctaLink || '/shop'}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 sm:px-7 sm:py-3.5 bg-[#081320] hover:bg-[#F97316] text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all duration-200 active:scale-95 group"
            >
              <span>{hero.ctaText || 'Shop Now'}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-2 sm:pt-4 border-t border-gray-200/60 flex items-center gap-2.5 sm:gap-5 flex-wrap text-gray-700">
            <div className="flex items-center space-x-1 sm:space-x-1.5 text-[10px] sm:text-xs font-bold text-gray-800">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span>{hero.trustPoints?.[0]?.text || 'Cash on Delivery'}</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-1.5 text-[10px] sm:text-xs font-bold text-gray-800">
              <Award className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span>{hero.trustPoints?.[1]?.text || 'Premium Quality'}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 sm:space-x-1.5 text-[10px] sm:text-xs font-bold text-gray-800">
              <Truck className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
              <span>{hero.trustPoints?.[2]?.text || 'Nationwide Shipping'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Subtle floating quality assurance tag on large screens */}
      <div className="hidden lg:flex absolute bottom-5 right-8 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-gray-200/80 shadow-md items-center space-x-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] font-extrabold text-gray-900">Curated Drop &bull; 100% Original</span>
      </div>

    </section>
  );
};
