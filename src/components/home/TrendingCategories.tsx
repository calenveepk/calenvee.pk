import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export const TrendingCategories: React.FC = () => {
  return (
    <section className="bg-white py-6 sm:py-10 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header: Center aligned on mobile, space-between on desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-1.5 sm:gap-0 mb-5 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
            Shop by Category
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#F97316] transition-colors group"
          >
            <span>View all categories</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Circular / Soft-Rounded Categories Row (Full-bleed edge-to-edge scrollable on mobile) */}
        <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-3 sm:gap-6 pb-2 sm:pb-0 justify-start sm:justify-between items-start -mx-3 px-3 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="flex-shrink-0 w-[78px] sm:w-28 lg:w-32 snap-center text-center"
            >
              <Link
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center space-y-1.5 sm:space-y-2.5 text-center"
              >
                {/* Circular Image Container */}
                <div className="w-[66px] h-[66px] sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-gray-50 border-2 border-gray-100 group-hover:border-[#F97316] group-hover:shadow-md transition-all duration-300 p-0.5 sm:p-1 flex items-center justify-center mx-auto">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full rounded-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* Category Name */}
                <span className="text-[11px] sm:text-sm font-bold text-gray-800 group-hover:text-[#F97316] transition-colors leading-tight line-clamp-1 text-center">
                  {cat.name}
                </span>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
