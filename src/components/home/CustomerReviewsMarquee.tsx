import React from 'react';
import { CheckCircle2, Tag, Star } from 'lucide-react';
import { ALL_CATEGORY_REVIEWS } from '../../data/categoryReviews';

export const CustomerReviewsMarquee: React.FC = () => {
  // Use a curated set of verified reviews duplicated for seamless continuous marquee
  const curatedReviews = ALL_CATEGORY_REVIEWS.slice(0, 10);
  const marqueeReviews = [...curatedReviews, ...curatedReviews];

  return (
    <section className="bg-white py-6 sm:py-8 border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5 sm:mb-7">
        {/* Standardized Centered Section Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider relative inline-block">
            WHAT OUR CUSTOMERS SAY
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-normal leading-relaxed">
            Real feedback from shoppers across Pakistan who wear and trust Calenvee everyday.
          </p>
        </div>
      </div>

      {/* Slow-Speed Continuous Marquee Container */}
      <div className="relative w-full overflow-hidden select-none py-2">
        {/* Left & Right Subtle Soft Edge Fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-20 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Scrolling Track: exactly 2 cards visible side-by-side on mobile, expanding comfortably on desktop */}
        <div className="flex w-max animate-marquee-slow transform-gpu space-x-3 sm:space-x-5 px-3">
          {marqueeReviews.map((rev, index) => (
            <div
              key={`${rev.id}-${index}`}
              className="w-[calc((100vw-36px)/2)] min-w-[155px] max-w-[195px] sm:w-[280px] sm:max-w-none md:w-[320px] p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gray-50/90 hover:bg-white border border-gray-200 hover:border-orange-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between flex-shrink-0 cursor-default"
            >
              <div className="space-y-1.5 sm:space-y-3">
                {/* Star Rating & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                    ))}
                  </div>
                  {rev.verifiedBuyer && (
                    <span className="inline-flex items-center space-x-1 text-[8px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                      <span className="hidden sm:inline">Verified</span>
                    </span>
                  )}
                </div>

                {/* Review Headline */}
                <h3 className="text-[11px] sm:text-sm font-bold text-gray-900 leading-tight line-clamp-1 sm:line-clamp-2">
                  "{rev.title}"
                </h3>

                {/* Review Quote Body */}
                <p className="text-[10px] sm:text-xs text-gray-600 font-normal leading-tight sm:leading-relaxed line-clamp-3 sm:line-clamp-4">
                  {rev.comment}
                </p>
              </div>

              {/* Reviewer Details & Product Purchased */}
              <div className="pt-2 sm:pt-3 border-t border-gray-200/70 mt-2 sm:mt-3 space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between text-[9px] sm:text-xs">
                  <span className="font-bold text-gray-900 truncate max-w-[70px] sm:max-w-none">
                    {rev.customerName}
                  </span>
                  <span className="text-gray-400 text-[8px] sm:text-[11px] truncate">
                    {rev.city}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[8px] sm:text-[10px] text-gray-500 bg-white px-1.5 sm:px-2 py-0.5 rounded border border-gray-200/80">
                  <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F97316] flex-shrink-0" />
                  <span className="truncate font-medium">{rev.productName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
