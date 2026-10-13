import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export const TrendingCategories: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-12 sm:py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading with Centered Orange Underline */}
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider relative inline-block">
            SHOP BY CATEGORY
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-normal leading-relaxed">
            Explore handcrafted timepieces, marine jewelry, and everyday accessories.
          </p>
        </div>

        {/* Categories Carousel / Slider Container with Navigation Arrows */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-700 hover:text-[#F97316] hover:border-[#F97316] transition-colors"
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 items-center justify-center text-gray-700 hover:text-[#F97316] hover:border-[#F97316] transition-colors"
            aria-label="Next categories"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontal Circular Category Grid / Scroll */}
          <div
            ref={scrollContainerRef}
            className="flex sm:grid sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-4 overflow-x-auto scrollbar-none pb-4 sm:pb-0 scroll-smooth justify-between"
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center flex-shrink-0 text-center w-28 sm:w-auto"
              >
                {/* Circular Image Container with Smooth Shadow & Zoom */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 group-hover:border-[#F97316] shadow-sm group-hover:shadow-lg transition-all duration-300 relative flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Category Title */}
                <span className="mt-3 text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#F97316] transition-colors line-clamp-1">
                  {cat.name.split('&')[0].trim()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
