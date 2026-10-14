import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { CATEGORY_REVIEWS } from '../data/categoryReviews';
import { ProductGrid } from '../components/products/ProductGrid';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { SEO } from '../components/common/SEO';
import { RealisticShieldIcon, RealisticStarIcon } from '../components/common/RealisticIcons';
import { Product } from '../types';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const category = CATEGORIES.find((c) => c.slug === slug);
  const categoryProducts = PRODUCTS.filter((p) => p.category === slug);

  // Reviews for this specific category
  const categoryReviews = (slug && CATEGORY_REVIEWS[slug]) || [
    {
      id: 'rev-def-1',
      categorySlug: slug || 'general',
      customerName: 'Hamza Tariq',
      city: 'Lahore',
      productName: category?.name || 'Calenvee Piece',
      rating: 5,
      date: 'March 12, 2026',
      title: 'Solid build quality and fast COD delivery',
      comment: 'Arrived within the 7-10 Working Days window in clean packaging. Exactly as pictured on the website.',
      verifiedBuyer: true,
    },
    {
      id: 'rev-def-2',
      categorySlug: slug || 'general',
      customerName: 'Bilal Farooq',
      city: 'Karachi',
      productName: category?.name || 'Calenvee Piece',
      rating: 5,
      date: 'March 08, 2026',
      title: 'Premium materials without retail markups',
      comment: 'Very satisfied with the purchase. The attention to detail is noticeable right away.',
      verifiedBuyer: true,
    },
  ];

  // Recommendations from other categories
  const otherCategoryProducts = PRODUCTS.filter((p) => p.category !== slug && p.isBestSeller).slice(0, 4);

  if (!category) {
    return (
      <div className="min-h-screen py-16 text-center px-4 bg-white text-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Collection Not Found</h1>
        <p className="text-gray-500 text-xs mb-6">The collection you are searching for does not exist.</p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#F97316] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#EA580C] transition-colors"
        >
          <span>Browse All Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-5 sm:py-7 bg-white text-gray-900">
      <SEO
        title={`${category.name} | Calenvee.pk`}
        description={category.description}
        keywords={category.seoKeywords.join(', ')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Breadcrumb — Centered */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 -mb-4 sm:-mb-6">
          <Link to="/" className="hover:text-[#F97316] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#F97316] transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{category.name}</span>
        </div>

        {/* Category Hero Banner — Centered */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 text-white p-6 sm:p-10 lg:p-12 shadow-lg text-center flex flex-col items-center">
          <div className="absolute inset-0 z-0">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover object-center opacity-40 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/90 via-black/70 to-black/90" />
          </div>

          <div className="relative z-10 max-w-xl mx-auto space-y-3 flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-wider">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal max-w-md mx-auto">
              {category.description}
            </p>

            <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-orange-200">
              <RealisticShieldIcon size={16} />
              <span>Direct-to-Consumer • Nationwide Cash on Delivery (7-10 Working Days)</span>
            </div>
          </div>
        </div>

        {/* 1. Category Products Section */}
        <div className="space-y-5">
          {/* Centered Section Header */}
          <div className="space-y-2 border-b border-gray-100 pb-5 text-center flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider">
              EXPLORE {category.name.toUpperCase()}
              <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
              Contemporary styling and premium durability, delivered with Nationwide Cash on Delivery (7-10 Working Days).
            </p>
          </div>

          {categoryProducts.length === 0 ? (
            <div className="text-center py-14 text-gray-500 text-xs bg-gray-50 rounded-xl border border-gray-200">
              New drops for {category.name} are arriving soon. Stay tuned!
            </div>
          ) : (
            <ProductGrid
              products={categoryProducts}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          )}
        </div>

        {/* 2. Specific Category Customer Reviews Section */}
        <div className="space-y-5 pt-4 border-t border-gray-100">
          {/* Centered Section Header */}
          <div className="space-y-2 border-b border-gray-100 pb-5 text-center flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider">
              WHAT BUYERS ARE SAYING
              <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
              Real impressions and daily styling feedback from verified clients wearing Calenvee across Pakistan.
            </p>
          </div>

          {/* Customer Reviews Grid / Mobile Scrolling */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-none snap-x snap-mandatory">
            {categoryReviews.map((rev) => (
              <div
                key={rev.id}
                className="w-[85vw] sm:w-[340px] md:w-auto flex-shrink-0 snap-start bg-gray-50/80 p-5 sm:p-6 rounded-2xl border border-gray-200 hover:border-orange-200 transition-colors flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  {/* Stars & Verified Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <RealisticStarIcon key={i} size={15} />
                      ))}
                    </div>
                    {rev.verifiedBuyer && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>

                  {/* Review Title */}
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">
                    "{rev.title}"
                  </h3>

                  {/* Review Text */}
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    {rev.comment}
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold text-gray-800">{rev.customerName}</span>
                  <span>{rev.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Recommendations From Other Categories */}
        <div className="space-y-5 pt-4 border-t border-gray-100">
          {/* Centered Section Header */}
          <div className="space-y-2 border-b border-gray-100 pb-5 text-center flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider">
              COMPLETE YOUR LOOK
              <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
              Carefully curated companion pieces handpicked to pair effortlessly with this collection.
            </p>
          </div>

          {/* Other Categories Navigation Pills — Centered */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
            {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-700 hover:text-[#F97316] bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 transition-colors uppercase tracking-wider whitespace-nowrap flex items-center space-x-1"
              >
                <span>{c.name}</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
              </Link>
            ))}
          </div>

          {/* Recommended Products Grid with Automatic Row Centering */}
          <ProductGrid
            products={otherCategoryProducts}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        </div>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
