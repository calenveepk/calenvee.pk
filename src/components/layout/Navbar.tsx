import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { CATEGORIES } from '../../data/categories';
import {
  RealisticWatchIcon,
  RealisticJewelryIcon,
  RealisticEyewearIcon,
  RealisticFragranceIcon,
  RealisticBagIcon,
  RealisticEverydayTechIcon,
} from '../common/RealisticIcons';

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
  const location = useLocation();

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

  const categoryIcons: Record<string, React.ReactNode> = {
    watches: <RealisticWatchIcon size={22} />,
    jewelry: <RealisticJewelryIcon size={22} />,
    eyewear: <RealisticEyewearIcon size={22} />,
    fragrances: <RealisticFragranceIcon size={22} />,
    'streetwear-bags': <RealisticBagIcon size={22} />,
    'tech-everyday': <RealisticEverydayTechIcon size={22} />,
  };

  return (
    <>
      <nav
        aria-label="Main Navigation"
        className={`w-full transition-all duration-300 bg-white border-b border-gray-100 ${
          isScrolled ? 'shadow-sm py-2 sm:py-2.5' : 'py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between relative">
            
            {/* Left: Mobile Menu Trigger (Mobile only) & Desktop Logo */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors -ml-1"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Desktop Logo: Crisp Calenvee with orange swoosh on clean white */}
              <Link to="/" className="hidden lg:flex items-center group">
                <img
                  src="/logo.png"
                  alt="Calenvee.pk"
                  className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Mobile View: Centered Store Logo */}
            <div className="lg:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
              <Link to="/" className="flex items-center">
                <img
                  src="/logo.png"
                  alt="Calenvee.pk"
                  className="h-8 w-auto object-contain max-w-[140px]"
                />
              </Link>
            </div>

            {/* Middle: Clean Desktop Navigation matching reference image */}
            <div className="hidden lg:flex items-center space-x-7">
              {/* Home */}
              <Link
                to="/"
                className={`text-xs font-bold uppercase tracking-wider py-2 transition-colors ${
                  location.pathname === '/' ? 'text-[#F97316]' : 'text-gray-800 hover:text-[#F97316]'
                }`}
              >
                HOME
              </Link>

              {/* Shop / Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                onMouseLeave={() => setIsCategoryDropdownOpen(false)}
              >
                <Link
                  to="/shop"
                  className={`flex items-center space-x-1 text-xs font-bold uppercase tracking-wider py-2 transition-colors ${
                    location.pathname.startsWith('/category') || location.pathname === '/shop'
                      ? 'text-[#F97316]'
                      : 'text-gray-800 hover:text-[#F97316]'
                  }`}
                >
                  <span>SHOP</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isCategoryDropdownOpen ? 'rotate-180 text-[#F97316]' : ''
                    }`}
                  />
                </Link>

                {/* Dropdown Menu (Audit 2 Requirement: Horizontal row of 3 categories per row, no item count) */}
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full -left-24 w-[640px] pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="bg-white rounded-2xl p-5 shadow-2xl border border-gray-100">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          Shop By Department
                        </span>
                        <Link
                          to="/shop"
                          className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1"
                        >
                          <span>Explore All</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* 3 Categories per row in clean simple grid: Only category name as requested */}
                      <div className="grid grid-cols-3 gap-2.5">
                        {CATEGORIES.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/category/${cat.slug}`}
                            className="group px-4 py-3.5 rounded-xl bg-gray-50 hover:bg-orange-50/70 border border-gray-100 hover:border-orange-200 transition-all duration-150 flex items-center justify-between"
                          >
                            <span className="text-xs font-bold text-gray-800 group-hover:text-[#F97316] transition-colors">
                              {cat.name}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#F97316] group-hover:translate-x-0.5 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Best Sellers */}
              <Link
                to="/best-sellers"
                className={`text-xs font-bold uppercase tracking-wider py-2 transition-colors ${
                  location.pathname === '/best-sellers' ? 'text-[#F97316]' : 'text-gray-800 hover:text-[#F97316]'
                }`}
              >
                BEST SELLERS
              </Link>

              {/* New Arrivals */}
              <Link
                to="/new-arrivals"
                className={`text-xs font-bold uppercase tracking-wider py-2 transition-colors ${
                  location.pathname === '/new-arrivals' ? 'text-[#F97316]' : 'text-gray-800 hover:text-[#F97316]'
                }`}
              >
                NEW ARRIVALS
              </Link>

              {/* Contact Us */}
              <Link
                to="/contact"
                className={`text-xs font-bold uppercase tracking-wider py-2 transition-colors ${
                  location.pathname === '/contact' ? 'text-[#F97316]' : 'text-gray-800 hover:text-[#F97316]'
                }`}
              >
                CONTACT US
              </Link>
            </div>

            {/* Right: Actions (Search, Account, Wishlist, Cart) matching reference image */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Icon */}
              <button
                onClick={onOpenSearch}
                className="p-2 text-gray-700 hover:text-[#F97316] hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>


              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-700 hover:text-[#F97316] hover:bg-gray-100 rounded-full transition-colors hidden sm:flex"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute 1 top-0 right-0 w-4 h-4 bg-[#F97316] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button with vibrant orange badge count matching reference image */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-[#F97316] hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#F97316] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white text-gray-900 p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src="/logo.png" alt="Calenvee.pk" className="h-8 w-auto" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-black rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-5 space-y-4">
                <div className="space-y-1">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-bold text-gray-900 hover:text-[#F97316] rounded-lg"
                  >
                    HOME
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-bold text-gray-900 hover:text-[#F97316] rounded-lg"
                  >
                    SHOP ALL PRODUCTS
                  </Link>
                  <Link
                    to="/best-sellers"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-bold text-gray-900 hover:text-[#F97316] rounded-lg"
                  >
                    BEST SELLERS
                  </Link>
                  <Link
                    to="/new-arrivals"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-bold text-gray-900 hover:text-[#F97316] rounded-lg"
                  >
                    NEW ARRIVALS
                  </Link>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
                    Categories
                  </div>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-[#F97316] transition-colors"
                      >
                        <span>{cat.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
                    Customer Care & Policies
                  </div>
                  <Link
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#F97316]"
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#F97316]"
                  >
                    About Calenvee
                  </Link>
                  <Link
                    to="/terms-and-conditions"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#F97316]"
                  >
                    Terms & 7-Day Exchange Policy
                  </Link>
                  <Link
                    to="/privacy-policy"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#F97316]"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#F97316]"
                  >
                    Saved Wishlist ({wishlistCount})
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              <div>Support: <strong className="text-gray-900">+923001234567</strong></div>
              <div>Social: <strong className="text-[#F97316]">@Calenvee.Pk</strong></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
