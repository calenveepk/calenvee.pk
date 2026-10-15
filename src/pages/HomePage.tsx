import React, { useState } from 'react';
import { SEO } from '../components/common/SEO';
import { HeroSection } from '../components/home/HeroSection';
import { TrendingCategories } from '../components/home/TrendingCategories';
import { FreshFindsBanner } from '../components/home/FreshFindsBanner';
import { TrendingNowSection } from '../components/home/TrendingNowSection';
import { MemberExclusiveBanner } from '../components/home/MemberExclusiveBanner';
import { ValuePropsBar } from '../components/home/ValuePropsBar';
import { RecommendedSection } from '../components/home/RecommendedSection';
import { DiscountOfferBanner } from '../components/home/DiscountOfferBanner';
import { CustomerReviewsMarquee } from '../components/home/CustomerReviewsMarquee';
import { NewsletterBanner } from '../components/home/NewsletterBanner';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { Product } from '../types';

export const HomePage: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Calenvee.pk — Quality, Style, Everyday."
        description="Calenvee.pk — Online store for premium watches, waterproof jewelry, sunglasses and accessories in Pakistan. Cash on Delivery nationwide (7-10 Working Days)."
        keywords="Calenvee.pk, watches Pakistan, jewelry Pakistan, online store Pakistan, sunglasses Pakistan, COD Pakistan"
      />

      {/* 1. Hero Section matching reference mockup */}
      <HeroSection />

      {/* 2. Shop By Category (Circular thumbnails, no Home & Living, no Baby Kids, no Grocery) */}
      <TrendingCategories />

      {/* 3. Fresh Finds / New Arrivals Showcase */}
      <FreshFindsBanner />

      {/* 4. Trending Now (Top selling products last 1 week strictly from Calenvee categories) */}
      <TrendingNowSection onQuickView={setQuickViewProduct} />

      {/* 5. Member Exclusive Section (Moved below Trending Now) */}
      <MemberExclusiveBanner />

      {/* 6. 4-Column Value Propositions Bar (Free Shipping, Easy Returns, Secure Payments, 24/7 Support) */}
      <ValuePropsBar />

      {/* 7. Recommended for You (Curated products strictly relating to Calenvee categories) */}
      <RecommendedSection onQuickView={setQuickViewProduct} />

      {/* 8. Discount Offer Section (Moved below Recommended for You) */}
      <DiscountOfferBanner />

      {/* 9. Customer Reviews Social Proof Marquee */}
      <CustomerReviewsMarquee />

      {/* 10. Stay in the Loop — Newsletter Email Signup Banner */}
      <NewsletterBanner />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
