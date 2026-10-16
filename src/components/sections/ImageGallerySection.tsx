import React from 'react';

interface ImageGallerySectionProps {
  settings: {
    title?: string;
    columns?: number;
    images?: Array<{
      url: string;
      alt: string;
      caption?: string;
    }>;
  };
}

export const ImageGallerySection: React.FC<ImageGallerySectionProps> = ({ settings }) => {
  const {
    title,
    columns = 4,
    images = [],
  } = settings;

  if (images.length === 0) return null;

  const getColClass = (cols: number) => {
    switch (cols) {
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: default: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
      case 6: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
    }
  };

  return (
    <section className="bg-white py-8 sm:py-14 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] text-center mb-6">
            {title}
          </h2>
        )}
        <div className={`grid ${getColClass(columns)} gap-3 sm:gap-4`}>
          {images.map((img, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden border border-gray-200 group aspect-square bg-gray-50 relative"
            >
              <img
                src={img.url}
                alt={img.alt || 'Calenvee Gallery Image'}
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-white text-[11px] truncate">
                  {img.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

