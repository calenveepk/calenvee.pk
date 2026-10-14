import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ChevronDown,
  Flame,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Truck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { CATEGORIES } from '../../data/categories';

interface NavbarProps {
  onOpenSearch: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const { totalItems, setIsOpen: setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
  }, [location.pathname, setIsMobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    } else {
      onOpenSearch();
    }
  };

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 transition-shadow duration-200">
        
        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Left: Mobile Menu Button & Brand Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors -ml-1"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/" className="flex items-center group">
                <img
                  src="/logo.png"
                  alt="Calenvee.pk"
                  className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Center: Search Bar matching reference mockup */}
            <div className="flex-1 max-w-2xl mx-auto hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search products, brands and more..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:border-[#081320] focus:bg-white text-gray-800 placeholder-gray-400 transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-1 top-1 bottom-1 px-3.5 bg-[#081320] hover:bg-[#F97316] text-white rounded-md flex items-center justify-center transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right: Actions (Wishlist & Cart only — NO account button) */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              
              {/* Mobile Search Icon */}
              <button
                onClick={onOpenSearch}
                className="md:hidden p-2 text-gray-700 hover:text-[#F97316] hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Button */}
              <Link
                to="/wishlist"
                className="flex items-center space-x-1.5 p-2 text-gray-700 hover:text-[#F97316] hover:bg-gray-100 rounded-lg transition-colors group"
                aria-label="Wishlist"
              >
                <div className="relative">
                  <Heart className={`w-5 h-5 transition-colors ${wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'group-hover:text-[#F97316]'}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#F97316] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold hidden xl:inline text-gray-700 group-hover:text-[#F97316]">
                  Wishlist
                </span>
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center space-x-1.5 p-2 text-gray-700 hover:text-[#F97316] hover:bg-gray-100 rounded-lg transition-colors group"
                aria-label="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 group-hover:text-[#F97316] transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#F97316] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold hidden xl:inline text-gray-700 group-hover:text-[#F97316]">
                  Cart
                </span>
              </button>

            </div>

          </div>

          {/* Mobile Search Input Bar */}
          <div className="mt-2 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products, brands and more..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#081320] text-gray-800 placeholder-gray-400"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#081320] text-white rounded-md flex items-center justify-center"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Secondary Category Sub-Navbar (Desktop) matching reference design */}
        <div className="hidden lg:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-7 text-xs font-semibold text-gray-700 py-2.5">
              
              {/* Categories Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-900 font-bold hover:text-[#F97316] transition-colors"
                >
                  <Menu className="w-4 h-4 text-gray-800" />
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setIsCategoryDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-xs text-gray-700 hover:bg-orange-50/60 hover:text-[#F97316] transition-colors"
                      >
                        <span>{cat.name}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <Link
                      to="/shop"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-xs font-bold text-[#F97316] hover:bg-orange-50/60"
                    >
                      <span>View All Products</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Core Links */}
              <Link
                to="/new-arrivals"
                className={`hover:text-[#F97316] transition-colors ${
                  location.pathname === '/new-arrivals' ? 'text-[#F97316] font-bold' : ''
                }`}
              >
                New Arrivals
              </Link>

              <Link
                to="/shop?filter=top-deals"
                className="flex items-center space-x-1 text-gray-800 hover:text-[#F97316] transition-colors group"
              >
                <span>Top Deals</span>
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-red-600 text-white rounded">
                  Hot
                </span>
              </Link>

              <Link
                to="/best-sellers"
                className={`hover:text-[#F97316] transition-colors ${
                  location.pathname === '/best-sellers' ? 'text-[#F97316] font-bold' : ''
                }`}
              >
                Best Sellers
              </Link>

              {/* Dynamic Category Shortcuts strictly from Calenvee */}
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={`hover:text-[#F97316] transition-colors ${
                    location.pathname === `/category/${cat.slug}` ? 'text-[#F97316] font-bold' : 'text-gray-600'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}

            </div>
          </div>
        </div>

      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white text-gray-900 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src="/logo.png" alt="Calenvee.pk" className="h-8 w-auto" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-4 space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  Home
                </Link>
                <Link
                  to="/new-arrivals"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  New Arrivals
                </Link>
                <Link
                  to="/best-sellers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  Best Sellers
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-[#F97316] rounded-lg hover:bg-orange-50"
                >
                  Shop All Products
                </Link>
              </div>

              {/* Categories list in Mobile Menu */}
              <div className="pt-2 border-t border-gray-100">
                <span className="block px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Shop By Category
                </span>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <span>{cat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Helpline Info */}
            <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-800">Helpline &amp; WhatsApp</p>
              <p className="font-mono text-[#F97316]">+92 300 1234567</p>
              <p className="text-[10px] text-gray-400">Nationwide Cash On Delivery (7-10 Days)</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
