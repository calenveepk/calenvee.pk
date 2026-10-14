import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
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
    <section className="bg-white py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header: Left Title & Right "View all recommendations →" */}
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
              Recommended for You
            </h2>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#081320]">
              Curated Selection
            </span>
          </div>

          <Link
            to="/shop?filter=recommended"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#F97316] transition-colors group"
          >
            <span>View all recommendations</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 5-Column Grid matching reference layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
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

