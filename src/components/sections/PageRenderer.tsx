import React, { useState } from 'react';
import { getSiteConfig } from '../../utils/configLoader';
import { SectionRenderer } from './SectionRenderer';
import { SEO } from '../common/SEO';
import { QuickViewModal } from '../common/QuickViewModal';
import { Product } from '../../types';

interface PageRendererProps {
  pageId: string;
  fallbackChildren?: React.ReactNode;
}

export const PageRenderer: React.FC<PageRendererProps> = ({ pageId, fallbackChildren }) => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const config = getSiteConfig();
  const page = config.pages[pageId];

  // Hidden means gone: if page is hidden, show unavailable notice with noindex
  if (!page || page.visible === false) {
    if (fallbackChildren) {
      return <>{fallbackChildren}</>;
    }
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white">
        <SEO title="Page Unavailable | Calenvee.pk" description="This page is currently unavailable." />
        <meta name="robots" content="noindex, nofollow" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] mb-3">
          Page Unavailable
        </h1>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          This section is currently offline or scheduled for a later release.
        </p>
        <a
          href="/"
          className="px-6 py-2.5 bg-[#0B132B] hover:bg-[#F97316] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
        >
          Return to Storefront
        </a>
      </div>
    );
  }

  const sections = page.sections || [];

  return (
    <div className="min-h-screen bg-white">
      {page.seo && (
        <SEO
          title={page.seo.title}
          description={page.seo.description}
        />
      )}

      {sections.length > 0 ? (
        sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            onQuickView={setQuickViewProduct}
          />
        ))
      ) : (
        fallbackChildren || null
      )}

      {/* Global Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

