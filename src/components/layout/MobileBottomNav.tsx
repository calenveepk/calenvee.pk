import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface MobileBottomNavProps {
  onOpenCategories: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCategories }) => {
  const location = useLocation();
  const { totalItems, setIsOpen: setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-2 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium transition-colors ${
            location.pathname === '/' ? 'text-[#F97316] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        {/* Categories */}
        <button
          onClick={onOpenCategories}
          className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium transition-colors ${
            location.pathname.startsWith('/category') || location.pathname === '/shop'
              ? 'text-[#F97316] font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span>Categories</span>
        </button>

        {/* Wishlist */}
        <Link
          to="/wishlist"
          className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium relative transition-colors ${
            location.pathname === '/wishlist' ? 'text-[#F97316] font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#F97316] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span>Saved</span>
        </Link>

        {/* Bag */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center py-1 px-3 text-[11px] font-medium relative text-gray-500 hover:text-gray-900"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-gray-800" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#F97316] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-gray-800 font-semibold">Bag</span>
        </button>
      </div>
    </nav>
  );
};
