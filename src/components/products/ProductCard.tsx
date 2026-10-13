import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPKR } from '../../utils/formatters';
import { RealisticStarIcon } from '../common/RealisticIcons';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors[0]);
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

  return (
    <div
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => {
        if (product.images.length > 1) setCurrentImageIndex(1);
      }}
      onMouseLeave={() => {
        setCurrentImageIndex(0);
      }}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 flex items-center justify-center p-4">
        {/* Top-Left Badges (Matching Reference) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isBestSeller && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F97316] text-white rounded">
              BEST SELLER
            </span>
          )}
          {product.discountPercentage > 0 && !product.isBestSeller && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F97316] text-white rounded">
              SAVE {product.discountPercentage}%
            </span>
          )}
          {product.isNewDrop && !product.isBestSeller && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F97316] text-white rounded">
              NEW
            </span>
          )}
        </div>

        {/* Top-Right Wishlist Heart */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 shadow-xs border border-gray-100 transition-colors"
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
            className="absolute bottom-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-[#F97316] shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Quick view"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}

        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images[currentImageIndex] || product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-108"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Information — Centered */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3 bg-white text-center">
        <div className="space-y-1 flex flex-col items-center">
          {/* Title */}
          <Link to={`/product/${product.slug}`} className="block w-full">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#F97316] line-clamp-1 transition-colors text-center">
              {product.name}
            </h3>
          </Link>

          {/* Category Label */}
          <div className="text-[11px] text-gray-500 font-medium text-center">
            {product.categoryLabel}
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-center space-x-2 pt-0.5">
            <span className="text-sm sm:text-base font-extrabold text-[#0B132B]">
              {formatPKR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Full-Width Orange ADD TO CART Button (Matching Reference Screenshot) */}
        <button
          onClick={handleQuickAdd}
          className="w-full py-2.5 px-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-xs transition-colors active:scale-98"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>ADD TO CART</span>
        </button>
      </div>
    </div>
  );
};
