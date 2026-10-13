import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../products/ProductCard';
import { QuickViewModal } from '../common/QuickViewModal';
import { Product } from '../../types';

export const FeaturedDrops: React.FC = () => {
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);

  // Filter actual best sellers for the 5-column showcase
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 5);

  return (
    <section className="bg-[#F9FAFB] py-12 sm:py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading with Centered Orange Underline */}
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider relative inline-block">
            BEST SELLERS
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-normal leading-relaxed">
            Top-rated styles chosen by customers nationwide across Pakistan.
          </p>
        </div>

        {/* 5-Column Responsive Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setSelectedQuickViewProduct(p)}
            />
          ))}
        </div>

        {/* Centered View All Action */}
        <div className="mt-10 text-center">
          <Link
            to="/best-sellers"
            className="inline-flex items-center text-xs font-bold text-gray-800 hover:text-white uppercase tracking-wider px-6 py-3 rounded-lg border border-gray-300 hover:border-[#F97316] bg-white hover:bg-[#F97316] shadow-xs hover:shadow-md transition-all duration-200"
          >
            <span>VIEW ALL BEST SELLERS</span>
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Quick View Modal */}
        <QuickViewModal
          product={selectedQuickViewProduct}
          onClose={() => setSelectedQuickViewProduct(null)}
        />
      </div>
    </section>
  );
};
