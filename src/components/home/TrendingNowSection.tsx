import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../products/ProductCard';
import { Product } from '../../types';

interface TrendingNowSectionProps {
  onQuickView?: (product: Product) => void;
}

export const TrendingNowSection: React.FC<TrendingNowSectionProps> = ({ onQuickView }) => {
  // Top selling products from last 1 week strictly from Calenvee's categories
  const topSellingIds = [
    'cv-watch-01',       // Obsidian Chronograph (Watches - #1)
    'cv-new-handbag',    // Milano Structured Handbag (Women - #2)
    'cv-jewel-01',       // 8mm Miami Cuban Link Chain (Jewelry - #3)
    'cv-deal-smartwatch',// Smart Watch Pro (Tech - #4)
    'cv-new-perfume',    // Santal 26 Eau de Parfum (Fragrances - #5)
  ];

  const trendingProducts = topSellingIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  return (
    <section className="bg-white py-5 sm:py-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        
        {/* Section Header: Center aligned on mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-1.5 sm:gap-0 mb-4 sm:mb-8 px-1 sm:px-0">
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
              Trending Now
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-[#EA580C]">
              Top Sellers Last Week
            </span>
          </div>

          <Link
            to="/shop?filter=trending"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#F97316] transition-colors group pt-1 sm:pt-0"
          >
            <span>View all products</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-5">
          {trendingProducts.map((product) => (
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
