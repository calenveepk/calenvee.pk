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

  // 2. Multi-product grid:
  // - 2 columns on mobile: if the last product card is alone on its row (odd count), it spans 2 cols & centers.
  // - 4 columns on desktop: if the last product card is alone on its row (4n+1 count), it spans 4 cols & centers.
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 justify-center ${className}
      [&:has(>&:nth-child(odd):last-child)>:last-child]:col-span-2
      md:[&:has(>&:nth-child(odd):last-child)>:last-child]:col-span-1
      [&:has(>&:nth-child(odd):last-child)>:last-child]:max-w-[calc(50%-0.5rem)]
      md:[&:has(>&:nth-child(odd):last-child)>:last-child]:max-w-none
      [&:has(>&:nth-child(odd):last-child)>:last-child]:mx-auto
      [&:has(>&:nth-child(odd):last-child)>:last-child]:w-full
      lg:[&:has(>&:nth-child(4n+1):last-child)>:last-child]:col-span-4
      lg:[&:has(>&:nth-child(4n+1):last-child)>:last-child]:max-w-[calc(25%-1.125rem)]
      lg:[&:has(>&:nth-child(4n+1):last-child)>:last-child]:mx-auto
      `}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
};

