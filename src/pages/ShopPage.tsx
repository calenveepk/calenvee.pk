import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { SEO } from '../components/common/SEO';
import { formatPKR } from '../utils/formatters';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<number>(6000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      if (product.price > priceRange) {
        return false;
      }
      if (inStockOnly && !product.inStock) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
      return 0;
    });
  }, [selectedCategory, sortBy, priceRange, inStockOnly]);

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    if (catSlug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catSlug });
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-white text-gray-900">
      <SEO
        title="All Collections | Calenvee.pk"
        description="Browse the complete collection of Calenvee timepieces, minimalist jewelry, eyewear, and everyday essentials in Pakistan with Cash on Delivery."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Page Banner */}
        <div className="mb-8 text-left space-y-2 border-b border-gray-100 pb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
            ALL PRODUCTS
            <span className="block w-16 h-1 bg-[#F97316] mt-2 rounded-full" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl font-normal leading-relaxed pt-0.5">
            Carefully curated contemporary accessories. Engineered with quality materials and delivered nationwide across Pakistan in 7 to 10 days on Cash on Delivery.
          </p>
        </div>

        {/* Filter Bar & Sort Controls */}
        <div className="bg-gray-50 p-4 rounded-xl mb-8 flex flex-col lg:flex-row items-center justify-between gap-4 border border-gray-200">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Pieces
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-[#F97316] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort & Price Controls */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end flex-wrap text-xs">
            {/* Price Slider */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 whitespace-nowrap font-medium">Max Price:</span>
              <input
                type="range"
                min="1500"
                max="6000"
                step="200"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-24 sm:w-32 accent-[#F97316] cursor-pointer"
              />
              <span className="font-bold text-[#0B132B] whitespace-nowrap">
                {formatPKR(priceRange)}
              </span>
            </div>

            {/* Sort Select */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 whitespace-nowrap font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Largest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid: 2 columns on mobile, 4 columns on desktop */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 space-y-4 bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">No items found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto font-normal">
              Try adjusting your price filter or selecting another collection.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setPriceRange(6000);
              }}
              className="px-6 py-2.5 bg-[#F97316] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:bg-[#EA580C] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
