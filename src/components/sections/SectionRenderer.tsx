import React from 'react';
import { SectionConfig } from '../../schema/sections';
import { isSectionActive } from '../../utils/configLoader';
import { HeroSection } from '../home/HeroSection';
import { CategoryGridSection } from './CategoryGridSection';
import { ProductGridSection } from './ProductGridSection';
import { DiscountOfferBanner } from '../home/DiscountOfferBanner';
import { PromoBannerSection } from './PromoBannerSection';
import { TrustBadgesSection } from './TrustBadgesSection';
import { CustomerReviewsMarquee } from '../home/CustomerReviewsMarquee';
import { NewsletterBanner } from '../home/NewsletterBanner';
import { BrandStorySection } from './BrandStorySection';
import { FaqSection } from './FaqSection';
import { RichTextSection } from './RichTextSection';
import { ImageGallerySection } from './ImageGallerySection';
import { Product } from '../../types';

interface SectionRendererProps {
  section: SectionConfig;
  onQuickView?: (product: Product) => void;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section, onQuickView }) => {
  // 1. Hidden means gone: if visible is false or scheduled out, return null (never rendered in DOM)
  if (!isSectionActive(section)) {
    return null;
  }

  const { type, settings = {} } = section;

  try {
    switch (type) {
      case 'hero':
        return <HeroSection settings={settings} />;

      case 'category-grid':
        return <CategoryGridSection settings={settings} />;

      case 'product-grid':
        return <ProductGridSection settings={settings} onQuickView={onQuickView} />;

      case 'deal-of-the-day':
        return <DiscountOfferBanner settings={settings} />;

      case 'promo-banner':
        return <PromoBannerSection settings={settings} />;

      case 'trust-badges':
        return <TrustBadgesSection settings={settings} />;

      case 'testimonials':
        return <CustomerReviewsMarquee />;

      case 'newsletter':
        return <NewsletterBanner />;

      case 'brand-story':
        return <BrandStorySection settings={settings} />;

      case 'faq':
        return <FaqSection settings={settings} />;

      case 'rich-text':
        return <RichTextSection settings={settings} />;

      case 'image-gallery':
        return <ImageGallerySection settings={settings} />;

      default:
        console.warn(`Unrecognized section type: "${type}"`);
        return null;
    }
  } catch (err) {
    console.error(`Error rendering section "${section.id}" (${type}):`, err);
    return null;
  }
};

