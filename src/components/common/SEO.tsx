import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = "Calenvee.pk — Premier online store for watches, 316L waterproof jewelry, eyewear, and everyday accessories in Pakistan. Cash on Delivery nationwide.",
  keywords = "Calenvee, Calenvee.pk, watches Pakistan, jewelry Pakistan, sunglasses Pakistan, COD Pakistan, online store Pakistan",
  image = "/logo.png",
  url = "https://calenvee.pk",
  type = "website",
  schema,
}) => {
  const fullTitle = !title || title === 'Calenvee.pk'
    ? 'Calenvee.pk'
    : `${title} | Calenvee.pk`;

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', image, true);
    setMeta('og:url', url, true);
    setMeta('og:type', type, true);
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // Schema.org script injection
    let scriptTag: HTMLScriptElement | null = null;
    if (schema) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.text = JSON.stringify(schema);
      scriptTag.id = 'dynamic-seo-schema';
      document.head.appendChild(scriptTag);
    }

    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.parentNode.removeChild(scriptTag);
      }
    };
  }, [fullTitle, description, keywords, image, url, type, schema]);

  return null;
};

