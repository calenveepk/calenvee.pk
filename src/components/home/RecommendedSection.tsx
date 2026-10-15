import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../products/ProductCard';
import { Product } from '../../types';

interface RecommendedSectionProps {
  onQuickView?: (product: Product) => void;
}

export const RecommendedSection: React.FC<RecommendedSectionProps> = ({ onQuickView }) => {
  // Recommended products strictly relating to Calenvee's core categories
  const recommendedIds = [
    'cv-watch-02',    // Emerald Royal Legacy Watch (Watches)
    'cv-new-sneakers',// Classic Low-Top Minimalist Sneakers (Men / Footwear)
    'cv-jewel-02',    // Celestial Compass Pendant Chain (Jewelry)
    'cv-bag-01',      // Heavyweight Canvas Everyday Tote (Women / Bags)
    'cv-scent-01',    // Midnight Amber Extract de Parfum (Fragrances)
  ];

  const recommendedProducts = recommendedIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  return (
    <section className="bg-white py-5 sm:py-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        
        {/* Section Header: Center aligned on mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-1.5 sm:gap-0 mb-4 sm:mb-8 px-1 sm:px-0">
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
              Recommended for You
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#081320]">
              Curated Selection
            </span>
          </div>

          <Link
            to="/shop?filter=recommended"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#F97316] transition-colors group pt-1 sm:pt-0"
          >
            <span>View all recommendations</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-5">
          {recommendedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
