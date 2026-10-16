import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { ProductCard } from '../products/ProductCard';
import { Product } from '../../types';
import { ProductGridSettings } from '../../schema/sections';

interface ProductGridSectionProps {
  settings: Partial<ProductGridSettings> & {
    title?: string;
    subtitle?: string;
    badge?: string;
    rule?: 'manual' | 'bestsellers' | 'new-drops' | 'trending' | 'category' | 'tag';
    productIds?: string[];
    categorySlug?: string;
    tag?: string;
    limit?: number;
    columnsDesktop?: number;
    columnsMobile?: number;
    viewAllLink?: string;
    viewAllText?: string;
  };
  onQuickView?: (product: Product) => void;
}

export const ProductGridSection: React.FC<ProductGridSectionProps> = ({
  settings,
  onQuickView,
}) => {
  const {
    title = 'FEATURED COLLECTION',
    subtitle,
    badge,
    rule = 'bestsellers',
    productIds = [],
    categorySlug,
    tag,
    limit = 8,
    columnsDesktop = 5,
    viewAllLink,
    viewAllText = 'View all products',
  } = settings;

  // Filter out any hidden products
  const activeProducts = PRODUCTS.filter((p: any) => p.status !== 'hidden' && !p.isArchived);

  let resolvedProducts: Product[] = [];

  if (rule === 'manual' && productIds.length > 0) {
    resolvedProducts = productIds
      .map((id) => activeProducts.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);
  } else if (rule === 'trending') {
    resolvedProducts = activeProducts.filter((p) => p.isTrending);
  } else if (rule === 'new-drops') {
    resolvedProducts = activeProducts.filter((p) => p.isNewDrop);
  } else if (rule === 'category' && categorySlug) {
    resolvedProducts = activeProducts.filter((p) => p.category === categorySlug);
  } else if (rule === 'tag' && tag) {
    resolvedProducts = activeProducts.filter((p) => p.tags && p.tags.includes(tag));
  } else {
    // Default to bestsellers
    resolvedProducts = activeProducts.filter((p) => p.isBestSeller);
    if (resolvedProducts.length === 0) {
      resolvedProducts = activeProducts;
    }
  }

  // Slice to limit
  resolvedProducts = resolvedProducts.slice(0, limit);

  // Hidden means gone: if 0 products match, hide section completely
  if (resolvedProducts.length === 0) {
    return null;
  }

  const getDesktopColClass = (cols: number) => {
    switch (cols) {
      case 2: return 'lg:grid-cols-2';
      case 3: return 'lg:grid-cols-3';
      case 4: return 'lg:grid-cols-4';
      case 5: default: return 'lg:grid-cols-5';
    }
  };

  return (
    <section className="bg-white py-5 sm:py-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-1.5 sm:gap-0 mb-4 sm:mb-8 px-1 sm:px-0">
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
              {title}
            </h2>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-[#EA580C]">
                {badge}
              </span>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 hidden md:block pl-2">
                {subtitle}
              </p>
            )}
          </div>

          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#F97316] transition-colors group pt-1 sm:pt-0"
            >
              <span>{viewAllText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Dynamic Responsive Product Grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${getDesktopColClass(columnsDesktop)} gap-2 sm:gap-4 lg:gap-5`}>
          {resolvedProducts.map((product) => (
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

