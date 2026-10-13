import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  id: string;
  badge: string;
  titlePrimary: string;
  titleHighlight: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  slogan: string;
  image: string;
  alt: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'collection',
    badge: 'CURATED COLLECTION',
    titlePrimary: 'Shop More,',
    titleHighlight: 'Save More!',
    subtitle: 'Discover amazing deals on your favorite lifestyle products, timepieces, luxury handbags, and modern essentials across Pakistan.',
    buttonText: 'EXPLORE COLLECTION',
    buttonLink: '/shop',
    slogan: 'SHOP SMART, LIVE BETTER',
    image: '/hero/hero_podium_collection.jpg',
    alt: 'Calenvee Curated Luxury Collection',
  },
  {
    id: 'timepieces',
    badge: 'SIGNATURE TIMEPIECES',
    titlePrimary: 'Modern Luxury,',
    titleHighlight: 'Precision Crafted',
    subtitle: 'Engineered chronograph timepieces and polarized designer eyewear crafted for daily distinction and lasting sophistication.',
    buttonText: 'SHOP TIMEPIECES',
    buttonLink: '/category/watches',
    slogan: 'PRECISION & DISTINCTION',
    image: '/hero/calenvee_hero_editorial.jpg',
    alt: 'Calenvee Luxury Chronograph & Eyewear',
  },
  {
    id: 'jewelry',
    badge: 'ROYAL GOLD EDITION',
    titlePrimary: 'Pure Elegance,',
    titleHighlight: '18K Gold Plated',
    subtitle: 'Waterproof, anti-tarnish jewelry and emerald sunburst timepieces engineered to retain their radiant luster forever.',
    buttonText: 'SHOP JEWELRY',
    buttonLink: '/category/jewelry',
    slogan: 'TARNISH-FREE & WATERPROOF',
    image: '/hero/calenvee_hero_gold.jpg',
    alt: 'Calenvee 18K Gold Plated Jewelry and Timepiece',
  },
  {
    id: 'unboxing',
    badge: 'PREMIUM EXPERIENCE',
    titlePrimary: 'Luxury Delivered,',
    titleHighlight: 'Cash On Delivery',
    subtitle: 'Signature velvet gift packaging, metal authenticity card, and 7-day hassle-free replacement warranty nationwide.',
    buttonText: 'VIEW NEW ARRIVALS',
    buttonLink: '/shop?sort=newest',
    slogan: 'NATIONWIDE COD 7-10 DAYS',
    image: '/hero/calenvee_hero_unboxing.jpg',
    alt: 'Calenvee Luxury Packaging and Unboxing',
  },
];

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = HERO_SLIDES.length;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, slideCount]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-4 sm:pb-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Full-Bleed Integrated Hero Card */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-[#081320] overflow-hidden shadow-2xl border border-slate-800/80 min-h-[350px] sm:min-h-[460px] lg:min-h-[520px] flex items-center">
        
        {/* Full-bleed background images with crossfade — strictly right-aligned */}
        {HERO_SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 z-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={s.image}
              alt={s.alt}
              className="w-full h-full object-cover object-right"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* Midnight Blue / Dark Slate Gradient Fade Overlay:
            Solid announcement-bar background color #081320 on the left where the text sits,
            fading smoothly to transparent on the right so the product image is 100% visible */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#081320] via-[#081320]/85 sm:via-[#081320]/75 to-transparent pointer-events-none" />

        {/* Subtle decorative dot grid on top right */}
        <div 
          className="absolute -top-10 -right-10 w-64 sm:w-96 h-64 sm:h-96 opacity-10 pointer-events-none z-[2]"
          style={{
            backgroundImage: 'radial-gradient(#F97316 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px'
          }}
        />

        {/* Left Content Area: Headline, Subtitle, Call to Action, and Slide Controls */}
        <div className="relative z-10 p-4 sm:p-8 lg:p-14 max-w-[60%] sm:max-w-md lg:max-w-xl space-y-2.5 sm:space-y-4 lg:space-y-5 text-left flex flex-col items-start">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/80 border border-slate-700/70 text-orange-400 text-[9px] sm:text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse"></span>
            <span>{slide.badge}</span>
          </div>

          {/* Main Title & Description */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
              {slide.titlePrimary}<br />
              <span className="text-[#F97316]">{slide.titleHighlight}</span>
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-300/90 font-normal leading-relaxed pt-0.5 line-clamp-2 sm:line-clamp-none">
              {slide.subtitle}
            </p>
          </div>

          {/* Primary Action Button & Slogan */}
          <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Link
              to={slide.buttonLink}
              className="inline-flex items-center space-x-2 px-4 py-2.5 sm:px-8 sm:py-3.5 lg:py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-[11px] sm:text-xs lg:text-sm uppercase tracking-wider rounded-lg sm:rounded-xl shadow-xl hover:shadow-orange-500/30 transition-all duration-200 active:scale-95 group"
            >
              <span>{slide.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <span className="text-[9px] sm:text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
              {slide.slogan}
            </span>
          </div>

          {/* Slide Navigation Dots and Arrows */}
          <div className="pt-2 flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              {HERO_SLIDES.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => goToSlide(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`transition-all duration-300 rounded-full ${
                    dotIdx === currentSlide
                      ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-[#F97316]'
                      : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center space-x-1 pl-2 border-l border-slate-700/60">
              <button
                onClick={prevSlide}
                aria-label="Previous slide"
                className="w-6 h-6 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next slide"
                className="w-6 h-6 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
