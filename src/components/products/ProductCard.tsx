import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPKR } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  showBadge?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  showBadge = true,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem, setIsOpen: setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors?.[0] || { name: 'Standard', hex: '#111111', inStock: true });
    setIsCartOpen(true);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const formatReviews = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => {
        if (product.images.length > 1) setCurrentImageIndex(1);
      }}
      onMouseLeave={() => {
        setCurrentImageIndex(0);
      }}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50/70 flex items-center justify-center p-3 sm:p-4">
        
        {/* Top-Left Badge */}
        {showBadge && (product.isBestSeller || product.discountPercentage > 0 || product.isNewDrop) && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {product.isBestSeller ? (
              <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#F97316] text-white rounded-md shadow-2xs">
                HOT
              </span>
            ) : product.discountPercentage > 0 ? (
              <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#081320] text-white rounded-md shadow-2xs">
                -{product.discountPercentage}%
              </span>
            ) : product.isNewDrop ? (
              <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded-md shadow-2xs">
                NEW
              </span>
            ) : null}
          </div>
        )}

        {/* Top-Right Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 shadow-2xs border border-gray-100 flex items-center justify-center transition-all duration-200 active:scale-90"
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button
            onClick={handleQuickViewClick}
            className="absolute bottom-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-[#F97316] shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Quick view"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}

        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images[currentImageIndex] || product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Information — Center-aligned in mobile view, left-aligned on desktop */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 bg-white text-center sm:text-left items-center sm:items-start">
        <div className="space-y-1 w-full flex flex-col items-center sm:items-start">
          {/* Title */}
          <Link to={`/product/${product.slug}`} className="block w-full text-center sm:text-left">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#F97316] line-clamp-1 transition-colors text-center sm:text-left">
              {product.name}
            </h3>
          </Link>

          {/* Category Label */}
          <div className="text-[11px] text-gray-400 font-medium text-center sm:text-left">
            {product.categoryLabel || product.category}
          </div>

          {/* Star Rating with Count (Centered on mobile) */}
          <div className="flex items-center justify-center sm:justify-start space-x-1 pt-0.5">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">
              ({formatReviews(product.reviewsCount || 120)})
            </span>
          </div>
        </div>

        {/* Bottom Row: Pricing & Cart Button (Centered on mobile) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 pt-2 border-t border-gray-50 w-full">
          <div className="flex items-baseline justify-center sm:justify-start space-x-1.5">
            <span className="text-xs sm:text-sm font-extrabold text-[#0B132B]">
              {formatPKR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Quick Add Cart Button: Full-width friendly on mobile, square button on desktop */}
          <button
            onClick={handleQuickAdd}
            className="w-full sm:w-8.5 h-8 sm:h-8.5 rounded-lg border border-gray-200 hover:border-[#F97316] hover:bg-[#F97316] text-gray-700 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95 shadow-2xs space-x-1.5 sm:space-x-0"
            title="Add to cart"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[11px] font-bold uppercase sm:hidden">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
