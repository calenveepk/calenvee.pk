import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { ProductGrid } from '../products/ProductGrid';
import { QuickViewModal } from '../common/QuickViewModal';
import { Product } from '../../types';

export const FeaturedDrops: React.FC = () => {
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<Product | null>(null);

  // New Arrivals matching the reference layout (4 items)
  const newArrivals = PRODUCTS.filter((p) => p.isNewDrop).slice(0, 4);

  return (
    <section className="bg-white py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Centered */}
        <div className="text-center mb-6 sm:mb-8 space-y-2 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
            New Arrivals
          </h2>
          <div>
            <Link
              to="/new-arrivals"
              className="text-xs sm:text-sm font-bold text-[#F97316] hover:text-[#EA580C] inline-flex items-center space-x-1 group transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Responsive Grid with Automatic Row Centering */}
        <ProductGrid
          products={newArrivals}
          onQuickView={(p) => setSelectedQuickViewProduct(p)}
        />

        {/* Quick View Modal */}
        <QuickViewModal
          product={selectedQuickViewProduct}
          onClose={() => setSelectedQuickViewProduct(null)}
        />

      </div>
    </section>
  );
};
