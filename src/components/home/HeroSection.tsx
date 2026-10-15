import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Award, Truck } from 'lucide-react';
import homeContentData from '../../data/homeContent.json';

interface HeroSlide {
  id?: string;
  kicker: string;
  headlinePrefix: string;
  headlineHighlight: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  image: string;
}

export const HeroSection: React.FC = () => {
  const rawHero = homeContentData.hero || {};

  const defaultSlide: HeroSlide = {
    id: 'slide-1',
    kicker: rawHero.kicker || 'QUALITY. STYLE. EVERYDAY.',
    headlinePrefix: rawHero.headlinePrefix || 'Everything You Love,',
    headlineHighlight: rawHero.headlineHighlight || 'All in One Place.',
    subtitle: rawHero.subtitle || 'Shop top-quality products across watches, jewelry, handbags, sunglasses, and fragrances with unbeatable prices and a seamless Cash on Delivery experience nationwide.',
    ctaText: rawHero.ctaText || 'Shop Now',
    ctaLink: rawHero.ctaLink || '/shop',
    image: rawHero.image || '/products/1792091254271-luxury_essentials_still_life__1_.webp'
  };

  const slides: HeroSlide[] = (rawHero.slides && Array.isArray(rawHero.slides) && rawHero.slides.length > 0)
    ? rawHero.slides
    : [defaultSlide];

  const trustPoints = rawHero.trustPoints || [
    { text: 'Cash on Delivery' },
    { text: 'Premium Quality' },
    { text: 'Nationwide Shipping' },
  ];

  const intervalSeconds = (rawHero as { autoIntervalSeconds?: number }).autoIntervalSeconds || 5;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate slides at regular interval (pauses on user hover/touch)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, intervalSeconds]);

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <section
      className="relative w-full bg-[#FAF7F2] border-b border-gray-100/80 shadow-xs overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      
      {/* 1. Full-Bleed Integrated Product Visuals (Right-Anchored in Dedicated Container with Soft Edge Shading, NO Gradients) */}
      <div className="absolute top-0 right-0 bottom-0 w-[45%] sm:w-[48%] lg:w-[50%] h-full overflow-hidden pointer-events-none z-0 shadow-[-12px_0_24px_-8px_rgba(0,0,0,0.06)]">
        {slides.map((slide, idx) => (
          <img
            key={slide.id || idx}
            src={slide.image}
            alt={slide.headlineHighlight || `Calenvee Slide ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-in-out ${
              idx === currentIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {/* 2. Content Container (Dedicated 55% Left Width - Zero Overlap with Right Visual) */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-7 lg:py-9 min-h-[295px] sm:min-h-[360px] lg:min-h-[420px] flex items-center">
        <div className="w-[55%] sm:w-[52%] lg:max-w-xl space-y-2 sm:space-y-3.5 text-left">
          
          {/* Dynamic Slide Content (Animated Keyed Transition) */}
          <div key={currentIndex} className="space-y-1 sm:space-y-2 transition-all duration-300">
            {/* Kicker Pill */}
            <div className="inline-flex items-center space-x-1.5 text-[9px] sm:text-xs font-black uppercase tracking-widest text-[#F97316]">
              <span>{activeSlide.kicker}</span>
            </div>

            {/* Main Headline & Description with Natural Text Shading */}
            <h1
              className="text-base sm:text-3xl lg:text-4xl font-black text-[#0B132B] tracking-tight leading-[1.15]"
              style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04)' }}
            >
              {activeSlide.headlinePrefix}<br />
              <span className="text-[#F97316]">{activeSlide.headlineHighlight}</span>
            </h1>
            <p
              className="text-[10px] sm:text-xs lg:text-sm text-gray-600 font-normal leading-relaxed line-clamp-2 sm:line-clamp-none"
              style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }}
            >
              {activeSlide.subtitle}
            </p>
          </div>

          {/* Shop CTA Button + Slide Navigation Indicators */}
          <div className="pt-0.5 sm:pt-1 flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              to={activeSlide.ctaLink || '/shop'}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-6 sm:py-3 bg-[#081320] hover:bg-[#F97316] text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider rounded-lg sm:rounded-xl shadow-md hover:shadow-orange-500/20 transition-all duration-200 active:scale-95 group"
            >
              <span>{activeSlide.ctaText || 'Shop Now'}</span>
              <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Slide Indicators (Pills) for direct switching between up to 3 slides */}
            {slides.length > 1 && (
              <div className="inline-flex items-center space-x-1 sm:space-x-1.5 px-1.5 py-1 rounded-full bg-black/5 backdrop-blur-xs">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Jump to hero slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-3.5 sm:w-6 bg-[#F97316]'
                        : 'w-1.5 bg-gray-400 hover:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="pt-1.5 sm:pt-3 border-t border-gray-200/60 flex items-center gap-2 sm:gap-4 flex-wrap text-gray-700">
            <div className="flex items-center space-x-1 text-[9px] sm:text-xs font-bold text-gray-800">
              <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#F97316] shrink-0" />
              <span>{trustPoints[0]?.text || 'Cash on Delivery'}</span>
            </div>
            <div className="flex items-center space-x-1 text-[9px] sm:text-xs font-bold text-gray-800">
              <Award className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#F97316] shrink-0" />
              <span>{trustPoints[1]?.text || 'Premium Quality'}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-[9px] sm:text-xs font-bold text-gray-800">
              <Truck className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#F97316] shrink-0" />
              <span>{trustPoints[2]?.text || 'Nationwide Shipping'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Floating quality badge on desktop */}
      <div className="hidden lg:flex absolute bottom-4 right-8 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-xs items-center space-x-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-extrabold text-gray-900 tracking-wider uppercase">
          Curated Drop &bull; Slide {currentIndex + 1} of {slides.length}
        </span>
      </div>

    </section>
  );
};
