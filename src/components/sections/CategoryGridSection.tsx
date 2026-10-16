import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

interface CategoryGridSectionProps {
  settings: {
    title?: string;
    subtitle?: string;
    columns?: number;
    limit?: number;
    viewAllLink?: string;
    viewAllText?: string;
  };
}

export const CategoryGridSection: React.FC<CategoryGridSectionProps> = ({ settings }) => {
  const {
    title = 'Shop by Category',
    viewAllLink = '/shop',
    viewAllText = 'View all categories',
    limit = 6,
  } = settings;

  // Filter out any hidden categories
  const activeCategories = CATEGORIES.filter((c: any) => c.status !== 'hidden' && !c.isArchived).slice(0, limit);

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-6 sm:py-10 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-1.5 sm:gap-0 mb-5 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
            {title}
          </h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#F97316] transition-colors group"
            >
              <span>{viewAllText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Categories Row */}
        <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory gap-3 sm:gap-6 pb-2 sm:pb-0 justify-start sm:justify-between items-start -mx-3 px-3 sm:mx-0 sm:px-0">
          {activeCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex-shrink-0 w-[78px] sm:w-28 lg:w-32 snap-center text-center"
            >
              <Link
                to={`/category/${cat.slug}`}
                className="group flex flex-col items-center space-y-1.5 sm:space-y-2.5 text-center"
              >
                <div className="w-[66px] h-[66px] sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-gray-50 border-2 border-gray-100 group-hover:border-[#F97316] group-hover:shadow-md transition-all duration-300 p-0.5 sm:p-1 flex items-center justify-center mx-auto">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full rounded-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

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

