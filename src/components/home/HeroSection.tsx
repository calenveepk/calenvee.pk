import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Sparkles, ShieldCheck, Truck, RotateCcw, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Auto-advance every 6 seconds (pauses on hover)
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
    >
      {/* 1. Full-Bleed Cinematic Background Image Carousel */}
      <div className="relative w-full min-h-[580px] sm:min-h-[620px] lg:min-h-[680px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0 overflow-hidden"
          >
            <img
              src={slide.image}
              alt={slide.headlineMain}
              className="w-full h-full object-cover object-center lg:object-right"
              loading="eager"
            />
            {/* Cinematic Gradient Scrim: Deep navy gradient on left for crystal-clear readability, feathering to reveal image */}
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#0B132B] via-[#0B132B]/85 sm:via-[#0B132B]/70 to-[#0B132B]/30 sm:to-transparent" />
            
            {/* Subtle bottom vignette to blend seamlessly into content below */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0B132B] to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* 2. Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 w-full">
          <div className="max-w-2xl text-left space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-4 sm:space-y-5"
              >
                {/* Badge Tag */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#F97316] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
                  <span className="text-white">{slide.badge}</span>
                </div>

                {/* Cinematic Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
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
                  <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
                  <span>Featured: <strong className="text-white font-medium">{slide.tag}</strong></span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Navigation Controls */}
            <div className="flex items-center space-x-4 pt-4 border-t border-white/15 max-w-lg">
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
