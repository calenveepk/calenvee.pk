import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export const TrendingCategories: React.FC = () => {
  return (
    <section className="bg-white py-6 sm:py-10 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header: Left Title & Right "View all categories →" */}
        <div className="flex items-center justify-between mb-5 sm:mb-8">
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

        {/* Circular / Soft-Rounded Categories Row (Scrollable on mobile, flex grid on desktop) */}
        <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-4 sm:gap-6 pb-2 sm:pb-0 justify-start sm:justify-between items-start">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="flex-shrink-0 w-24 sm:w-28 lg:w-32 snap-center text-center"
            >
              <Link
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center space-y-2.5"
              >
                {/* Circular Image Container matching reference */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-gray-50 border-2 border-gray-100 group-hover:border-[#F97316] group-hover:shadow-md transition-all duration-300 p-1 flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full rounded-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* Category Name */}
                <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#F97316] transition-colors leading-tight line-clamp-1">
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
