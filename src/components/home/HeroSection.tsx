import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import homeContentData from '../../data/homeContent.json';

interface HeroSlide {
  id?: string;
  kicker?: string;
  headlinePrefix?: string;
  headlineHighlight?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  image: string;
  imageAlt?: string;
}

export interface HeroSectionProps {
  settings?: {
    autoIntervalSeconds?: number;
    slides?: HeroSlide[];
    trustPoints?: Array<{ text: string; icon?: string }>;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings }) => {
  const rawHero: any = (settings && settings.slides && settings.slides.length > 0)
    ? settings
    : (homeContentData.hero || {});

  const defaultSlide: HeroSlide = {
    id: 'slide-1',
    kicker: rawHero.kicker || 'QUALITY. STYLE. EVERYDAY.',
    headlinePrefix: rawHero.headlinePrefix || 'Everything You Love,',
    headlineHighlight: rawHero.headlineHighlight || 'All in One Place.',
    subtitle: rawHero.subtitle || 'Shop top-quality products across watches, jewelry, handbags, sunglasses, and fragrances with unbeatable prices and a seamless Cash on Delivery experience nationwide.',
    ctaText: rawHero.ctaText || 'Shop Now',
    ctaLink: rawHero.ctaLink || '/shop',
    image: rawHero.image || '/products/1792095143426-luxury_accessories_still_life_with_backpack.png',
    imageAlt: 'Calenvee Luxury Lifestyle Collection'
  };

  const slides: HeroSlide[] = (rawHero.slides && Array.isArray(rawHero.slides) && rawHero.slides.length > 0)
    ? rawHero.slides
    : [defaultSlide];

  const intervalSeconds = (rawHero as { autoIntervalSeconds?: number }).autoIntervalSeconds || 5;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-rotate slides at regular interval (pauses on user hover/touch)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, intervalSeconds, handleNext]);

  return (
    <section
      className="relative w-full aspect-[16/9] sm:aspect-[2/1] lg:aspect-[2.4/1] max-h-[620px] bg-neutral-900 overflow-hidden select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      aria-label="Featured Promotions"
    >
      {/* Full-Bleed Integrated Banner Slides */}
      {slides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              isActive
                ? 'opacity-100 z-10 pointer-events-auto'
                : 'opacity-0 z-0 pointer-events-none'
            }`}
            aria-hidden={!isActive}
          >
            <Link
              to={slide.ctaLink || '/shop'}
              className="block w-full h-full relative cursor-pointer"
              tabIndex={isActive ? 0 : -1}
              aria-label={slide.imageAlt || slide.headlineHighlight || `Hero slide ${idx + 1}`}
            >
              <img
                src={slide.image}
                alt={slide.imageAlt || slide.headlineHighlight || `Calenvee Banner ${idx + 1}`}
                className="w-full h-full object-cover object-center"
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </Link>
          </div>
        );
      })}

      {/* Navigation Arrows (for multiple slides) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/35 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-md active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/35 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-md active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators (Pills) */}
      {slides.length > 1 && (
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 sm:space-x-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-sm">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Jump to slide ${idx + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-5 sm:w-7 bg-[#F97316]'
                  : 'w-1.5 sm:w-2 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
