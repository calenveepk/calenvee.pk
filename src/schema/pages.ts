import { z } from 'zod';
import { SectionSchema } from './sections';
import { GlobalConfigSchema } from './global';

export const PageSeoSchema = z.object({
  title: z.string().default('Calenvee.pk'),
  description: z.string().default(''),
  canonical: z.string().optional(),
  noindex: z.boolean().default(false),
});

export const PageSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  visible: z.boolean().default(true),
  seo: PageSeoSchema,
  sections: z.array(SectionSchema).default([]),
});

export const SiteConfigSchema = z.object({
  version: z.number().default(1),
  lastModified: z.string().default(() => new Date().toISOString()),
  global: GlobalConfigSchema,
  pages: z.record(z.string(), PageSchema),
});

export type PageConfig = z.infer<typeof PageSchema>;
export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type PageSeo = z.infer<typeof PageSeoSchema>;
