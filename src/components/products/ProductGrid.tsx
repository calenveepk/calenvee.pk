import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onQuickView,
  className = '',
}) => {
  if (products.length === 0) return null;

  // 1. If there is only 1 single product card in the entire section, center it
  if (products.length === 1) {
    return (
      <div className={`flex justify-center w-full py-2 ${className}`}>
        <div className="w-full max-w-[280px] sm:max-w-[300px]">
          <ProductCard product={products[0]} onQuickView={onQuickView} />
        </div>
      </div>
    );
  }

  const count = products.length;
  // Detect if the final item will be the ONLY card on its horizontal row across breakpoints:
  // - 2 columns on mobile (odd count: 3, 5, 7, 9...)
  // - 3 columns on tablet md (count % 3 === 1: 4, 7, 10...)
  // - 4 columns on desktop lg (count % 4 === 1: 5, 9, 13...)
  const isAloneMobile = count % 2 === 1;
  const isAloneMd = count % 3 === 1;
  const isAloneLg = count % 4 === 1;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 ${className}`}>
      {products.map((product, index) => {
        const isLast = index === count - 1;

        if (isLast) {
          let wrapperClasses = 'w-full';
          let innerClasses = 'w-full';

          // Mobile (2 columns): If alone on row, span 2 columns & center horizontally
          if (isAloneMobile) {
            wrapperClasses += ' col-span-2 flex justify-center';
            innerClasses += ' max-w-[calc(50%-0.4375rem)]';
          } else {
            wrapperClasses += ' col-span-1 block';
          }

          // Tablet (3 columns): If alone on row, span 3 columns & center horizontally
          if (isAloneMd) {
            wrapperClasses += ' md:col-span-3 md:flex md:justify-center';
            innerClasses += ' md:max-w-[calc(33.333%-0.875rem)]';
          } else {
            wrapperClasses += ' md:col-span-1 md:block';
            innerClasses += ' md:max-w-none';
          }

          // Desktop (4 columns): If alone on row, span 4 columns & center horizontally
          if (isAloneLg) {
            wrapperClasses += ' lg:col-span-4 lg:flex lg:justify-center';
            innerClasses += ' lg:max-w-[calc(25%-1.125rem)]';
          } else {
            wrapperClasses += ' lg:col-span-1 lg:block';
            innerClasses += ' lg:max-w-none';
          }

          return (
            <div key={product.id} className={wrapperClasses.trim()}>
              <div className={innerClasses.trim()}>
                <ProductCard product={product} onQuickView={onQuickView} />
              </div>
            </div>
          );
        }

        return (
          <div key={product.id} className="w-full">
            <ProductCard product={product} onQuickView={onQuickView} />
          </div>
        );
      })}
    </div>
  );
};
