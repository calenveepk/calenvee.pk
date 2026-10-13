import React from 'react';
import { SEO } from '../components/common/SEO';
import { HeroSection } from '../components/home/HeroSection';
import { ValuePropsBar } from '../components/home/ValuePropsBar';
import { TrendingCategories } from '../components/home/TrendingCategories';
import { FeaturedDrops } from '../components/home/FeaturedDrops';
import { SpecialOfferBanner } from '../components/home/SpecialOfferBanner';
import { AboutBriefSection } from '../components/home/AboutBriefSection';
import { WhyShopWithUs } from '../components/home/WhyShopWithUs';
import { CustomerReviewsMarquee } from '../components/home/CustomerReviewsMarquee';
import { NewsletterBanner } from '../components/home/NewsletterBanner';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Calenvee.pk"
        description="Calenvee.pk — Online store for premium watches, waterproof jewelry, sunglasses and accessories in Pakistan. Cash on Delivery nationwide (7-10 Days)."
        keywords="Calenvee.pk, watches Pakistan, jewelry Pakistan, online store Pakistan, sunglasses Pakistan, COD Pakistan"
      />

      {/* 1. Hero Section matching reference image */}
      <HeroSection />

      {/* 2. 4-Column Value Propositions Bar below hero */}
      <ValuePropsBar />

      {/* 3. Shop By Category (5 Cards) */}
      <TrendingCategories />

      {/* 4. Deal of the Day (Flash Countdown Banner) */}
      <SpecialOfferBanner />

      {/* 5. New Arrivals (4-Column Grid) */}
      <FeaturedDrops />

      {/* 6. About Calenvee Brief Brand Intro */}
      <AboutBriefSection />

      {/* 7. Why Shop With Us? 4 trust guarantees */}
      <WhyShopWithUs />

      {/* 8. Customer Reviews Across All Categories (Slow Marquee) */}
      <CustomerReviewsMarquee />

      {/* 9. Newsletter Email Signup Banner */}
      <NewsletterBanner />
    </div>
  );
};
