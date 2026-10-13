import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export const TrendingCategories: React.FC = () => {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading matching reference design */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
            Shop By Category
          </h2>
        </div>

        {/* 5-Card Grid matching reference design */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {CATEGORIES.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center bg-gray-50/60 hover:bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Image Container with Soft Rounded Corners */}
              <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Category Name & "Shop Now →" Link */}
              <div className="mt-3.5 mb-1 text-center space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#F97316] transition-colors">
                  {cat.name}
                </h3>
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-gray-500 group-hover:text-[#F97316] transition-colors">
                  <span>Shop Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};
