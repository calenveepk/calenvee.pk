import React from 'react';
import { sanitizeHtml } from '../../utils/configLoader';

interface RichTextSectionProps {
  settings: {
    title?: string;
    contentHtml?: string;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    alignment?: 'left' | 'center' | 'right';
  };
}

export const RichTextSection: React.FC<RichTextSectionProps> = ({ settings }) => {
  const {
    title,
    contentHtml = '',
    maxWidth = 'lg',
    alignment = 'left',
  } = settings;

  const sanitized = sanitizeHtml(contentHtml);
  if (!sanitized && !title) return null;

  const widthClass = {
    sm: 'max-w-2xl',
    md: 'max-w-3xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    full: 'max-w-7xl',
  }[maxWidth] || 'max-w-4xl';

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[alignment] || 'text-left';

  return (
    <section className="bg-white py-8 sm:py-14 border-b border-gray-100">
      <div className={`${widthClass} mx-auto px-4 sm:px-6 lg:px-8 ${alignClass}`}>
        {title && (
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] mb-6">
            {title}
          </h2>
        )}
        <div
          className="prose prose-stone max-w-none text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      </div>
    </section>
  );
};

