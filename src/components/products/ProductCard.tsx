import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye, Check } from 'lucide-react';
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
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors?.[0] || { name: 'Standard', hex: '#111111', inStock: true });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
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
      className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
      onMouseEnter={() => {
        if (product.images.length > 1) setCurrentImageIndex(1);
      }}
      onMouseLeave={() => {
        setCurrentImageIndex(0);
      }}
    >
      {/* Product Image Frame — Minimal padding on mobile for maximum product visibility */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50/80 flex items-center justify-center p-1.5 sm:p-3.5">
        
        {/* Top-Left Badge */}
        {showBadge && (product.isBestSeller || product.discountPercentage > 0 || product.isNewDrop) && (
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {product.isBestSeller ? (
              <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] font-black uppercase tracking-wider bg-[#F97316] text-white rounded shadow-2xs">
                HOT
              </span>
            ) : product.discountPercentage > 0 ? (
              <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#081320] text-white rounded shadow-2xs">
                -{product.discountPercentage}%
              </span>
            ) : product.isNewDrop ? (
              <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded shadow-2xs">
                NEW
              </span>
            ) : null}
          </div>
        )}

        {/* Top-Right Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 shadow-2xs border border-gray-100 flex items-center justify-center transition-all duration-200 active:scale-90"
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button
            onClick={handleQuickViewClick}
            className="hidden sm:flex absolute bottom-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-[#F97316] shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* Product Information — Clean left alignment maximizing width utilization */}
      <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between space-y-1.5 bg-white text-left items-start">
        <div className="space-y-0.5 sm:space-y-1 w-full text-left">
          {/* Title */}
          <Link to={`/product/${product.slug}`} className="block w-full text-left">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#F97316] line-clamp-1 transition-colors text-left leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Category & Rating Row on Mobile */}
          <div className="flex items-center justify-between text-left w-full pt-0.5">
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium truncate max-w-[65%]">
              {product.categoryLabel || product.category}
            </span>

            {/* Compact Star Rating */}
            <div className="flex items-center space-x-0.5 shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-600">
                {product.rating || 5}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Price & Touch-Friendly Add to Cart Button */}
        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-gray-100 w-full mt-auto">
          {/* Price Container */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-1.5 leading-tight min-w-0">
            <span className="text-xs sm:text-sm font-black text-[#0B132B] whitespace-nowrap">
              {formatPKR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[9px] sm:text-xs text-gray-400 line-through whitespace-nowrap">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Touch-Friendly Add to Bag Button */}
          <button
            onClick={handleQuickAdd}
            className={`h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-lg border transition-all duration-200 active:scale-90 shadow-2xs flex items-center justify-center cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-gray-200 bg-gray-50 hover:border-[#F97316] hover:bg-[#F97316] text-gray-800 hover:text-white'
            }`}
            title={isAdded ? 'Added to bag' : 'Add to cart'}
            aria-label={isAdded ? 'Added to bag' : 'Add to cart'}
          >
            {isAdded ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
