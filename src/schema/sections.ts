import { z } from 'zod';

export const ImageWithAltSchema = z.object({
  url: z.string().min(1),
  alt: z.string().min(1, 'Images require descriptive alt text'),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  visible: z.boolean().default(true),
  settings: z.record(z.string(), z.any()).default({}),
});

export const SectionTypeEnum = z.enum([
  'hero',
  'announcement-bar',
  'category-grid',
  'product-grid',
  'deal-of-the-day',
  'promo-banner',
  'trust-badges',
  'testimonials',
  'brand-story',
  'faq',
  'newsletter',
  'rich-text',
  'image-gallery',
  'footer',
]);

export type SectionType = z.infer<typeof SectionTypeEnum>;

// 1. Hero / Slider Section
export const HeroSlideSchema = z.object({
  id: z.string(),
  kicker: z.string().default(''),
  headlinePrefix: z.string().default(''),
  headlineHighlight: z.string().default(''),
  subtitle: z.string().default(''),
  ctaText: z.string().default('Shop Now'),
  ctaLink: z.string().default('/shop'),
  image: z.string().min(1),
  imageAlt: z.string().min(1, 'Hero slide images require descriptive alt text').default('Calenvee Luxury Collection'),
  secondaryCtaText: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
});

export const HeroSectionSettingsSchema = z.object({
  autoIntervalSeconds: z.number().min(2).max(30).default(5),
  slides: z.array(HeroSlideSchema).min(1),
  trustPoints: z.array(z.object({
    text: z.string(),
    icon: z.string(),
  })).default([]),
});

// 2. Category Grid Section
export const CategoryGridSettingsSchema = z.object({
  title: z.string().default('SHOP BY CATEGORY'),
  subtitle: z.string().default('Explore our curated luxury collections designed for distinction.'),
  columns: z.number().min(2).max(6).default(3),
  limit: z.number().min(1).max(24).default(6),
  viewAllLink: z.string().default('/shop'),
  viewAllText: z.string().default('View All Categories'),
});

// 3. Product Grid Section
export const ProductGridRuleEnum = z.enum([
  'manual',
  'bestsellers',
  'new-drops',
  'trending',
  'category',
  'tag',
]);

export const ProductGridSettingsSchema = z.object({
  title: z.string().default('FEATURED COLLECTION'),
  subtitle: z.string().default('Handpicked bestsellers crafted for timeless distinction.'),
  rule: ProductGridRuleEnum.default('bestsellers'),
  categorySlug: z.string().optional(),
  tag: z.string().optional(),
  productIds: z.array(z.string()).default([]),
  limit: z.number().min(1).max(30).default(8),
  columnsDesktop: z.number().min(2).max(5).default(4),
  columnsMobile: z.number().min(1).max(2).default(2),
  viewAllLink: z.string().optional(),
  viewAllText: z.string().default('View All Products'),
});

// 4. Deal of the Day Section
export const DealOfTheDaySettingsSchema = z.object({
  dealId: z.string().default('deal-obsidian-chrono'),
  title: z.string().default('DEAL OF THE DAY'),
  subtitle: z.string().default('Limited-time special release with exclusive pricing nationwide.'),
  ctaText: z.string().default('CLAIM DEAL NOW'),
  autoHideWhenExpired: z.boolean().default(true),
});

// 5. Promotional Banners / Trio
export const PromoBannerItemSchema = z.object({
  id: z.string(),
  badge: z.string().default('Special Offer'),
  title: z.string(),
  subtitle: z.string().default(''),
  discountBadge: z.string().optional(),
  ctaText: z.string().default('Shop Now'),
  link: z.string().default('/shop'),
  image: z.string(),
  imageAlt: z.string().default('Promotional Offer'),
  bgGradient: z.string().optional(),
});

export const PromoBannerSettingsSchema = z.object({
  layout: z.enum(['single', 'split-2', 'trio-3']).default('trio-3'),
  banners: z.array(PromoBannerItemSchema).default([]),
});

// 6. Trust Badges / USPs
export const TrustBadgeItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  icon: z.string().default('Truck'),
});

export const TrustBadgesSettingsSchema = z.object({
  title: z.string().default('OUR SERVICE PROMISE'),
  subtitle: z.string().default('Honest service, reliable delivery, and customer care you can depend on.'),
  badges: z.array(TrustBadgeItemSchema).default([]),
});

// 7. Testimonials / Customer Reviews
export const TestimonialsSettingsSchema = z.object({
  title: z.string().default('WHAT OUR CUSTOMERS SAY'),
  subtitle: z.string().default('Real feedback from verified purchasers across Karachi, Lahore, Islamabad, and nationwide.'),
  layout: z.enum(['marquee', 'grid', 'carousel']).default('marquee'),
  limit: z.number().min(3).max(30).default(12),
});

// 8. Brand Story Section
export const BrandStorySettingsSchema = z.object({
  badge: z.string().default('ABOUT CALENVEE'),
  title: z.string().default('MODERN TIMEPIECES. TIMELESS LUXURY.'),
  paragraphs: z.array(z.string()).default([
    'Calenvee was founded with a singular purpose: to deliver precision-crafted luxury timepieces, tarnish-resistant jewelry, and premium accessories across Pakistan without the inflated markup of overseas imports.',
    'Every piece is individually inspected for finish, movement accuracy, and enduring durability before being packed in our signature unboxing presentation box.'
  ]),
  stats: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).default([]),
  image: z.string().optional(),
  imageAlt: z.string().default('Calenvee Brand Story'),
});

// 9. FAQ Section
export const FaqItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const FaqSectionSettingsSchema = z.object({
  title: z.string().default('FREQUENTLY ASKED QUESTIONS'),
  subtitle: z.string().default('Answers to common inquiries regarding ordering, delivery, and payments.'),
  items: z.array(FaqItemSchema).default([]),
});

// 10. Newsletter / WhatsApp CTA Section
export const NewsletterSettingsSchema = z.object({
  title: z.string().default('Stay in the Loop'),
  subtitle: z.string().default('Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.'),
  buttonText: z.string().default('Subscribe'),
  discountPromoCode: z.string().default('CALENVEE10'),
});

// 11. Rich Text Section
export const RichTextSettingsSchema = z.object({
  title: z.string().optional(),
  contentHtml: z.string().min(1),
  maxWidth: z.enum(['sm', 'md', 'lg', 'xl', 'full']).default('lg'),
  alignment: z.enum(['left', 'center', 'right']).default('left'),
});

// 12. Image Gallery Section
export const ImageGallerySettingsSchema = z.object({
  title: z.string().optional(),
  columns: z.number().min(2).max(6).default(4),
  images: z.array(ImageWithAltSchema).default([]),
});

// Universal Section Definition
export const SectionSchema = z.object({
  id: z.string(),
  type: SectionTypeEnum,
  visible: z.boolean().default(true),
  showFrom: z.string().optional(), // ISO 8601 with +05:00
  showUntil: z.string().optional(), // ISO 8601 with +05:00
  settings: z.record(z.string(), z.any()).default({}),
  blocks: z.array(BlockSchema).default([]),
});

export type SectionConfig = z.infer<typeof SectionSchema>;
export type BlockConfig = z.infer<typeof BlockSchema>;
export type HeroSlide = z.infer<typeof HeroSlideSchema>;
export type ProductGridSettings = z.infer<typeof ProductGridSettingsSchema>;
