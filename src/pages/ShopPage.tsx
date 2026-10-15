import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, ArrowRight, PackageX } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { Product } from '../types';
import { ProductGrid } from '../components/products/ProductGrid';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { SEO } from '../components/common/SEO';
import { searchProducts } from '../utils/searchEngine';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const searchQuery = (searchParams.get('search') || searchParams.get('q') || '').trim();

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync category state with URL parameters
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const filteredProducts = useMemo(() => {
    // 1. Initial base items: if search query is present, use intelligent searchEngine!
    const baseItems = searchQuery ? searchProducts(searchQuery) : PRODUCTS;

    return baseItems.filter((product) => {
      // 2. Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // 3. Stock filter
      if (inStockOnly && !product.inStock) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // If search query is active and sort is 'featured', maintain intelligent relevance ranking
      if (searchQuery && sortBy === 'featured') return 0;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
      return 0;
    });
  }, [selectedCategory, sortBy, inStockOnly, searchQuery]);

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    const newParams = new URLSearchParams(searchParams);
    if (catSlug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', catSlug);
    }
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.delete('q');
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen py-5 sm:py-7 bg-white text-gray-900">
      <SEO
        title={searchQuery ? `Search: "${searchQuery}" | Calenvee.pk` : "All Collections | Calenvee.pk"}
        description="Browse the complete collection of Calenvee timepieces, minimalist jewelry, eyewear, and everyday essentials in Pakistan with Cash on Delivery."
      />

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        
        {/* Editorial Page Banner / Search Results Header */}
        <div className="mb-6 text-center space-y-2 border-b border-gray-100 pb-5 flex flex-col items-center">
          {searchQuery ? (
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-[#EA580C]">
                <Search className="w-3.5 h-3.5" />
                <span>SEARCH RESULTS</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
                "{searchQuery}"
              </h1>
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">
                  Found {filteredProducts.length} matching product{filteredProducts.length === 1 ? '' : 's'}
                </span>
                <button
                  onClick={handleClearSearch}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#F97316] hover:underline bg-white px-2.5 py-0.5 rounded-full border border-orange-200 shadow-2xs"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Search</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
                ALL PRODUCTS
                <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
                Carefully curated contemporary timepieces, jewelry, sunglasses, and lifestyle essentials delivered nationwide across Pakistan on Cash on Delivery.
              </p>
            </div>
          )}
        </div>

        {/* Filter Bar & Sort Controls */}
        <div className="bg-gray-50 p-3.5 sm:p-4 rounded-xl mb-6 flex flex-col lg:flex-row items-center justify-between gap-3 border border-gray-200">
          {/* Category Filter Pills — Centered / Scrollable */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
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
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-[#F97316] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-center lg:justify-end text-xs">
            <span className="text-gray-500 whitespace-nowrap font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length > 0 ? (
          <ProductGrid
            products={filteredProducts}
            onQuickView={setQuickViewProduct}
          />
        ) : (
          <div className="text-center py-16 px-4 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center mx-auto shadow-inner">
              <PackageX className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                No products found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {searchQuery
                  ? `We couldn't find any products matching "${searchQuery}". Try searching for 'watch', 'chain', 'sunglasses', or 'perfume'.`
                  : 'No products available under this filter.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  handleClearSearch();
                  handleCategoryChange('all');
                }}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#081320] hover:bg-[#F97316] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all"
              >
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
