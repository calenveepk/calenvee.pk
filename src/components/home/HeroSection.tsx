import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Sparkles, Truck, RotateCcw, Star } from 'lucide-react';

interface HeroSlide {
  id: string;
  badge: string;
  headlineMain: string;
  headlineAccent: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  image: string;
  tag: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-editorial-obsidian',
    badge: 'SIGNATURE DROP 2026',
    headlineMain: 'TIMELESS ARCHITECTURE.',
    headlineAccent: 'ENGINEERED FOR MODERN PRESENCE.',
    description: 'Hand-finished chronographs, anti-tarnish jewelry, and architectural UV400 shades. Accessible luxury delivered across Pakistan with Cash on Delivery.',
    primaryCtaText: 'SHOP BEST SELLERS',
    primaryCtaLink: '/best-sellers',
    secondaryCtaText: 'EXPLORE CATALOG',
    secondaryCtaLink: '/shop',
    image: '/hero/calenvee_hero_editorial.jpg',
    tag: 'OBSIDIAN CHRONO & TRAVERTINE SERIES',
  },
  {
    id: 'slide-royal-gold',
    badge: 'ROYAL HERITAGE COLLECTION',
    headlineMain: 'EMERALD SUNBURST.',
    headlineAccent: 'LUXURY THAT SPEAKS FOR ITSELF.',
    description: 'Dual-tone gold stainless steel, radiant sunburst dials, and curated Cuban link chains. Backed by 1-Year Official Calenvee Warranty.',
    primaryCtaText: 'VIEW TIMEPIECES',
    primaryCtaLink: '/category/watches',
    secondaryCtaText: 'NEW ARRIVALS',
    secondaryCtaLink: '/new-arrivals',
    image: '/hero/calenvee_hero_gold.jpg',
    tag: 'ROYAL GOLD & EMERALD AUTOMATIC',
  },
  {
    id: 'slide-luxury-unboxing',
    badge: '100% OPEN-PARCEL CONFIDENCE',
    headlineMain: 'WHAT YOU SEE.',
    headlineAccent: 'IS EXACTLY WHAT YOU HOLD.',
    description: 'Official rigid matte-black box, metal authenticity card, and physical package inspection on Cash on Delivery. 7-10 days delivery to any city in Pakistan.',
    primaryCtaText: 'OFFICIAL UNBOXING',
    primaryCtaLink: '/about',
    secondaryCtaText: 'CLIENT REVIEWS (4.9★)',
    secondaryCtaLink: '/reviews',
    image: '/hero/calenvee_hero_unboxing.jpg',
    tag: 'DELUXE PACKAGING & AUTHENTICITY CARD',
  },
];

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 6 seconds (pauses on hover or touch)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentSlide];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section
      className="relative w-full bg-[#0B132B] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* 1. Full-Bleed Background Images (Zero GPU transforms, stable CSS cross-fade) */}
      <div className="relative w-full min-h-[540px] sm:min-h-[600px] lg:min-h-[660px] flex items-center">
        {HERO_SLIDES.map((s, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 z-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              <img
                src={s.image}
                alt={s.headlineMain}
                className="w-full h-full object-cover object-center lg:object-right"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              {/* Cinematic Gradient Scrim: Deep navy gradient for crystal-clear readability */}
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#0B132B] via-[#0B132B]/85 sm:via-[#0B132B]/75 to-[#0B132B]/40 sm:to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0B132B] to-transparent pointer-events-none" />
            </div>
          );
        })}

        {/* 2. Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24 w-full">
          <div className="max-w-2xl text-left space-y-5 sm:space-y-6">
            <div className="space-y-3.5 sm:space-y-4 transition-all duration-500 ease-out">
              {/* Badge Tag */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F97316] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                <span className="text-white">{slide.badge}</span>
              </div>

              {/* Cinematic Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                {slide.headlineMain}
                <span className="block text-[#F97316] mt-1">{slide.headlineAccent}</span>
              </h1>

              {/* Subtitle / Description */}
              <p className="text-xs sm:text-sm md:text-base text-gray-200 font-light leading-relaxed max-w-xl">
                {slide.description}
              </p>

              {/* Action CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={slide.primaryCtaLink}
                  className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 sm:py-4 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-xl hover:shadow-orange-500/30 transition-all duration-200 group active:scale-98"
                >
                  <span>{slide.primaryCtaText}</span>
                  <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to={slide.secondaryCtaLink}
                  className="inline-flex items-center justify-center px-6 sm:px-7 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg transition-colors"
                >
                  <span>{slide.secondaryCtaText}</span>
                </Link>
              </div>

              {/* Active Piece Indicator Pill */}
              <div className="pt-2 text-[11px] font-mono tracking-wider text-gray-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                <span>Featured: <strong className="text-white font-medium">{slide.tag}</strong></span>
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center space-x-4 pt-3 border-t border-white/15 max-w-lg">
              {/* Prev / Next Arrows */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors backdrop-blur-md shadow-xs active:scale-95"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors backdrop-blur-md shadow-xs active:scale-95"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bars */}
              <div className="flex items-center space-x-2 flex-1">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-10 sm:w-12 bg-[#F97316]' : 'w-3 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Slide Counter */}
              <span className="text-xs font-mono font-bold text-gray-300">
                0{currentSlide + 1} / 0{HERO_SLIDES.length}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Floating Quick-Stats Trust Bar across the bottom of the Hero */}
        <div className="hidden lg:block absolute bottom-6 right-8 z-20">
          <div className="bg-black/40 backdrop-blur-lg border border-white/15 rounded-xl px-5 py-3 shadow-2xl flex items-center space-x-6 text-white text-xs">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-[#F97316] fill-[#F97316]" />
              <div className="leading-tight">
                <span className="font-bold block">4.9 / 5 Rating</span>
                <span className="text-[10px] text-gray-300">2,500+ Verified Buyers</span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-[#F97316]" />
              <div className="leading-tight">
                <span className="font-bold block">Nationwide COD</span>
                <span className="text-[10px] text-gray-300">7-10 Days Delivery</span>
              </div>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-[#F97316]" />
              <div className="leading-tight">
                <span className="font-bold block">7-Day Exchange</span>
                <span className="text-[10px] text-gray-300">WhatsApp Support</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
