import React, { useState } from 'react';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/products/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { SEO } from '../components/common/SEO';
import { Product } from '../types';

export const NewArrivalsPage: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter products that are marked as New Drop
  const newArrivals = PRODUCTS.filter((p) => p.isNewDrop);

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-white text-gray-900">
      <SEO
        title="New Arrivals | Calenvee.pk"
        description="Explore the latest drops in timepieces, jewelry, eyewear, and lifestyle essentials at Calenvee.pk. Nationwide Cash on Delivery (7-10 Days)."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner — Centered */}
        <div className="mb-8 text-center space-y-2 border-b border-gray-100 pb-6 flex flex-col items-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            NEW ARRIVALS
            <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
            Discover our newest contemporary pieces designed for modern daily styling. Delivered nationwide with Cash on Delivery in 7 to 10 days.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

