import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../utils/formatters';
import { SEO } from '../components/common/SEO';

export const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToBag = (product: any) => {
    addItem(product, product.colors[0]);
    toggleWishlist(product);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-white text-gray-900">
      <SEO
        title="Saved Items | Calenvee.pk"
        description="View and manage your saved Calenvee pieces. Move to bag and checkout with Cash on Delivery nationwide in Pakistan."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-100 gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0B132B] uppercase tracking-wider">
              SAVED PIECES
              <span className="block w-16 h-1 bg-[#F97316] mt-2 rounded-full" />
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-normal pt-0.5">
              {wishlist.length} saved design{wishlist.length === 1 ? '' : 's'} ready for fast Cash on Delivery checkout across Pakistan.
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5 self-start sm:self-auto font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl p-8 border border-gray-200 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-gray-400 mx-auto border border-gray-200">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              No Saved Pieces
            </h3>
            <p className="text-xs text-gray-500 font-normal leading-relaxed">
              Explore our timepieces, waterproof marine jewelry, and eyewear to curate your personal collection.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlist.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-gray-50 p-4 flex items-center justify-center">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white text-red-500 shadow-xs border border-gray-200 hover:scale-110 transition-transform"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] text-[#F97316] font-bold uppercase tracking-wider block">
                      {product.categoryLabel}
                    </span>
                    <Link to={`/product/${product.slug}`} className="block">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-[#F97316] line-clamp-1 transition-colors">
                        {product.name}
                      </h4>
                    </Link>
                    <div className="pt-1 text-sm font-extrabold text-[#0B132B]">
                      {formatPKR(product.price)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMoveToBag(product)}
                    className="w-full py-2.5 px-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move To Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
