import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { CATEGORIES } from '../../data/categories';
import { PRODUCTS } from '../../data/products';
import storeSettingsData from '../../data/storeSettings.json';
import { formatPKR } from '../../utils/formatters';
import { getLiveSuggestions } from '../../utils/searchEngine';

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
  const [isLiveSearchOpen, setIsLiveSearchOpen] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

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
    setIsLiveSearchOpen(false);
  }, [location.pathname, setIsMobileMenuOpen]);

  // Click outside listener to close live search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setIsLiveSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live matching products as user types using Smart Search Engine
  const matchingProducts = useMemo(() => {
    return getLiveSuggestions(searchInput, 5);
  }, [searchInput]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setIsLiveSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleSelectProduct = (slug: string) => {
    setIsLiveSearchOpen(false);
    setSearchInput('');
    navigate(`/product/${slug}`);
  };

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 transition-shadow duration-200">
        
        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          <div className="relative flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Left: Mobile Menu Button & Desktop Brand Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 z-10">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors -ml-1"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Desktop Logo (hidden on mobile, visible on md and up) */}
              <Link to="/" className="hidden md:flex items-center group">
                <img
                  src="/logo.png"
                  alt="Calenvee.pk"
                  className="h-9 md:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Mobile Centered Brand Logo (strictly center-aligned & slightly zoomed in on mobile screens) */}
            <div className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <Link to="/" className="flex items-center group py-0.5">
                <img
                  src="/logo.png"
                  alt="Calenvee.pk"
                  className="h-9 w-auto object-contain transform scale-110 transition-transform duration-200 group-hover:scale-115"
                />
              </Link>
            </div>

            {/* Center: Desktop Search Bar with Live Suggestions Dropdown */}
            <div ref={desktopSearchRef} className="flex-1 max-w-2xl mx-auto hidden md:block relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search products, brands and more..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setIsLiveSearchOpen(true);
                  }}
                  onFocus={() => {
                    if (searchInput.trim()) setIsLiveSearchOpen(true);
                  }}
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

              {/* Desktop Live Search Dropdown */}
              {isLiveSearchOpen && searchInput.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  {matchingProducts.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      <div className="px-4 py-2 bg-gray-50/70 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Matching Products
                      </div>
                      {matchingProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p.slug)}
                          className="px-4 py-2.5 hover:bg-orange-50/60 cursor-pointer flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-10 h-10 object-contain rounded-md bg-gray-50 p-0.5 border border-gray-100"
                            />
                            <div>
                              <div className="text-xs font-bold text-gray-900 group-hover:text-[#F97316] transition-colors line-clamp-1">
                                {p.name}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {p.categoryLabel}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-[#0B132B]">
                            {formatPKR(p.price)}
                          </span>
                        </div>
                      ))}
                      <div
                        onClick={handleSearchSubmit}
                        className="px-4 py-2.5 bg-gray-50 hover:bg-orange-50 text-center text-xs font-bold text-[#F97316] cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <span>View all matching results for "{searchInput}"</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No products found for "{searchInput}". Press enter to view all items.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Actions (Wishlist & Cart only — NO duplicate search button, NO account button) */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 z-10">
              
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

          {/* Mobile Full-Width Search Input Bar with Live Suggestions Dropdown (Only One Search Option in Mobile) */}
          <div ref={mobileSearchRef} className="mt-2 md:hidden relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products, brands and more..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setIsLiveSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchInput.trim()) setIsLiveSearchOpen(true);
                }}
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

            {/* Mobile Live Search Dropdown */}
            {isLiveSearchOpen && searchInput.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                {matchingProducts.length > 0 ? (
                  <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
                    <div className="px-3.5 py-1.5 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Matching Products
                    </div>
                    {matchingProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p.slug)}
                        className="px-3.5 py-2.5 hover:bg-orange-50/60 cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-9 h-9 object-contain rounded-md bg-gray-50 p-0.5 border border-gray-100"
                          />
                          <div>
                            <div className="text-xs font-bold text-gray-900 line-clamp-1">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {p.categoryLabel}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-[#0B132B]">
                          {formatPKR(p.price)}
                        </span>
                      </div>
                    ))}
                    <div
                      onClick={handleSearchSubmit}
                      className="px-3.5 py-2 bg-gray-50 text-center text-xs font-bold text-[#F97316] cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <span>View all results for "{searchInput}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-gray-500">
                    No products found for "{searchInput}".
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Secondary Category Sub-Navbar (Desktop) */}
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
                to="/best-sellers"
                className={`hover:text-[#F97316] transition-colors ${
                  location.pathname === '/best-sellers' ? 'text-[#F97316] font-bold' : ''
                }`}
              >
                Best Sellers
              </Link>

              {/* Dynamic Category Shortcuts */}
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
              <a
                href={`https://wa.me/${storeSettingsData.whatsappRaw}`}
                className="font-mono text-[#F97316] hover:underline block"
              >
                {storeSettingsData.whatsappNumber}
              </a>
              <p className="text-[10px] text-gray-400">{storeSettingsData.deliveryWindow}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
