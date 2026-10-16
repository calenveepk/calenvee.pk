import { z } from 'zod';
import storeSettingsData from '../data/storeSettings.json';

export const ThemeTokensSchema = z.object({
  brandNavy: z.string().default('#0B132B'),
  brandOrange: z.string().default('#F97316'),
  brandNavyHover: z.string().default('#1C2541'),
  brandOrangeHover: z.string().default('#EA580C'),
  fontFamily: z.string().default('Inter, system-ui, sans-serif'),
});

export const SocialLinksSchema = z.object({
  instagram: z.string().default('https://instagram.com/calenvee.pk'),
  facebook: z.string().default('https://facebook.com/calenvee.pk'),
  tiktok: z.string().default(''),
  whatsapp: z.string().default(''),
});

export const ContactDetailsSchema = z.object({
  storeName: z.string().min(1).default(storeSettingsData.storeName || 'Calenvee.pk'),
  storeSlogan: z.string().default(storeSettingsData.storeSlogan || 'SHOP SMART, LIVE BETTER'),
  whatsappNumber: z.string().min(5).default(storeSettingsData.whatsappNumber || ''),
  whatsappRaw: z.string().min(5).default(storeSettingsData.whatsappRaw || ''),
  supportEmail: z.string().email().default(storeSettingsData.supportEmail || 'calenvee.pk@gmail.com'),
  deliveryWindow: z.string().default(storeSettingsData.deliveryWindow || 'Nationwide Delivery (7-10 Working Days)'),
  address: z.string().default(storeSettingsData.address || 'Online E-Commerce Store -- Serving All Pakistan Cities'),
  city: z.string().default(storeSettingsData.city || 'Pakistan'),
  country: z.string().default(storeSettingsData.country || 'Pakistan'),
});

export const ShippingSettingsSchema = z.object({
  freeShippingThreshold: z.number().nonnegative().default(storeSettingsData.freeShippingThreshold || 3500),
  standardShippingFee: z.number().nonnegative().default(storeSettingsData.standardShippingFee || 250),
  defaultDeliveryWindow: z.string().default('7-10 Working Days'),
  shippingPolicySummary: z.string().default('Nationwide Cash on Delivery across all cities and towns in Pakistan.'),
});

export const PaymentMethodConfigSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().default(''),
  providerName: z.string().default(''),
  accountTitle: z.string().default(''),
  accountNumber: z.string().default(''),
  bankName: z.string().optional(),
  iban: z.string().optional(),
  raastId: z.string().optional(),
  instructions: z.string().default(''),
});

export const PaymentSettingsSchema = z.object({
  cod: PaymentMethodConfigSchema.default({
    enabled: true,
    title: 'Cash on Delivery (COD)',
    providerName: 'TCS / Trax Express Logistics',
    accountTitle: 'Calenvee COD',
    accountNumber: '-',
    instructions: 'Pay cash to the delivery rider at your doorstep upon receiving the parcel.',
  }),
  jazzcash: PaymentMethodConfigSchema.default({
    enabled: true,
    title: 'JazzCash Mobile Account',
    providerName: 'JazzCash',
    accountTitle: 'Calenvee Official',
    accountNumber: '03001234567',
    instructions: 'Send payment via JazzCash App or *786# and share the receipt on WhatsApp.',
  }),
  easypaisa: PaymentMethodConfigSchema.default({
    enabled: true,
    title: 'EasyPaisa Mobile Account',
    providerName: 'EasyPaisa',
    accountTitle: 'Calenvee Official',
    accountNumber: '03001234567',
    instructions: 'Send payment via EasyPaisa App or *786# and share the receipt on WhatsApp.',
  }),
  bankTransfer: PaymentMethodConfigSchema.default({
    enabled: true,
    title: 'Online Bank Transfer / Raast Instant',
    providerName: 'Meezan Bank Limited',
    accountTitle: 'Calenvee Official',
    accountNumber: '01020304050607',
    iban: 'PK00MEZN0001020304050607',
    raastId: '03001234567',
    instructions: 'Transfer funds via Bank App or Raast Instant, then send the slip on WhatsApp.',
  }),
});

export const CardSettingsSchema = z.object({
  showBadge: z.boolean().default(true),
  showRating: z.boolean().default(true),
  showCompareAtPrice: z.boolean().default(true),
  showQuickAdd: z.boolean().default(true),
  showWishlist: z.boolean().default(true),
});

export const NavItemSchema = z.object({
  label: z.string(),
  url: z.string(),
  badge: z.string().optional(),
  highlight: z.boolean().optional(),
});

export const HeaderNavigationSchema = z.object({
  logoText: z.string().default('CALENVEE'),
  logoUrl: z.string().default('/logo.png'),
  faviconUrl: z.string().default('/favicon.png'),
  menuItems: z.array(NavItemSchema).default([
    { label: 'Shop All', url: '/shop' },
    { label: 'Watches', url: '/category/watches' },
    { label: 'Jewelry', url: '/category/jewelry' },
    { label: 'Handbags', url: '/category/women' },
    { label: 'Sunglasses', url: '/category/sunglasses' },
    { label: 'Fragrances', url: '/category/beauty' },
    { label: 'Tech Essentials', url: '/category/electronics' },
  ]),
});

export const FooterColumnSchema = z.object({
  title: z.string(),
  links: z.array(z.object({ label: z.string(), url: z.string() })),
});

export const FooterSchema = z.object({
  columns: z.array(FooterColumnSchema).default([]),
  copyright: z.string().default('© 2026 Calenvee.pk. All rights reserved.'),
  paymentIcons: z.array(z.string()).default(['COD', 'JazzCash', 'EasyPaisa', 'Bank Transfer']),
});

export const SeoDefaultsSchema = z.object({
  siteTitle: z.string().default('Calenvee.pk | Premium Timepieces & Lifestyle Store'),
  metaDescription: z.string().default('Pakistan’s trusted lifestyle destination for precision chronographs, anti-tarnish jewelry, and designer accessories. Cash on delivery nationwide.'),
  canonicalUrl: z.string().default('https://calenvee.pk'),
  ogImage: z.string().default('/logo.png'),
});

export const GlobalConfigSchema = z.object({
  announcementBar: z.object({
    enabled: z.boolean().default(true),
    messages: z.array(z.string()).default([
      'Nationwide Cash on Delivery (7-10 Working Days)',
      'Free Nationwide Delivery On Orders Over Rs. 3,500',
      'SHOP SMART, LIVE BETTER -- Premium Timepieces & Accessories',
      '7-Day Replacement & Exchange Guarantee',
    ]),
    speed: z.number().default(4000),
  }),
  themeTokens: ThemeTokensSchema,
  socialLinks: SocialLinksSchema,
  contact: ContactDetailsSchema,
  shipping: ShippingSettingsSchema,
  payments: PaymentSettingsSchema,
  cardSettings: CardSettingsSchema,
  header: HeaderNavigationSchema,
  footer: FooterSchema,
  seo: SeoDefaultsSchema,
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
export type CardSettings = z.infer<typeof CardSettingsSchema>;
export type ShippingSettings = z.infer<typeof ShippingSettingsSchema>;
export type PaymentSettings = z.infer<typeof PaymentSettingsSchema>;
