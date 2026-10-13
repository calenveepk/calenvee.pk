import React, { useState } from 'react';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/products/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { SEO } from '../components/common/SEO';
import { Product } from '../types';

export const BestSellersPage: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter products that are marked as Best Seller
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller);

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-white text-gray-900">
      <SEO
        title="Best Sellers | Calenvee.pk"
        description="Explore the most ordered and highly requested lifestyle pieces and timepieces at Calenvee.pk with Nationwide Cash on Delivery (7-10 Days)."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="mb-8 text-left space-y-2 border-b border-gray-100 pb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            BEST SELLERS COLLECTION
            <span className="block w-16 h-1 bg-[#F97316] mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl font-normal leading-relaxed pt-0.5">
            Our most ordered timepieces, jewelry, and daily essentials across Pakistan. Delivered with Cash on Delivery in 7 to 10 days.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
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

