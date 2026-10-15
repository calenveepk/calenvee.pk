import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { MarqueeBanner } from './components/common/MarqueeBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { SearchModal } from './components/layout/SearchModal';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BestSellersPage } from './pages/BestSellersPage';
import { NewArrivalsPage } from './pages/NewArrivalsPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { ReturnsRefundsPage } from './pages/ReturnsRefundsPage';
import { TrackOrderPage } from './pages/TrackOrderPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <CartProvider>
      <WishlistProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#F97316] selection:text-white antialiased">
            {/* Sticky Header: Announcement Bar stacked seamlessly above Navbar */}
            <header className="sticky top-0 z-50 w-full shadow-sm">
              <MarqueeBanner />
              <Navbar
                onOpenSearch={() => setIsSearchOpen(true)}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
            </header>

            {/* Main Page View */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/best-sellers" element={<BestSellersPage />} />
                <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-and-conditions" element={<TermsPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/shipping" element={<ShippingPolicyPage />} />
                <Route path="/returns-refunds" element={<ReturnsRefundsPage />} />
                <Route path="/return-policy" element={<ReturnsRefundsPage />} />
                <Route path="/refund-policy" element={<ReturnsRefundsPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/track" element={<TrackOrderPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />

            {/* Global Slideout Drawers & Modals */}
            <CartDrawer />
            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />

            {/* WhatsApp Floating Toggle at Lower Right */}
            <WhatsAppButton />

            {/* Native Mobile App-Style Bottom Navigation Bar */}
            <MobileBottomNav
              onOpenCategories={() => setIsMobileMenuOpen(true)}
            />
          </div>
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
