import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { Product, ProductVariantColor, ProductVariantSize } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPKR } from '../../utils/formatters';
import { RealisticStarIcon, RealisticTruckIcon } from './RealisticIcons';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductVariantColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<ProductVariantSize | undefined>(
    product.sizes ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = () => {
    addItem(product, selectedColor, selectedSize, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Gallery */}
          <div className="p-6 bg-gray-50 flex flex-col justify-between space-y-4 border-b md:border-b-0 md:border-r border-gray-200">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-white border border-gray-200 relative flex items-center justify-center">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
              {product.discountPercentage > 0 && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F97316] text-white rounded">
                    Save {product.discountPercentage}%
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors bg-white ${
                      selectedImage === idx ? 'border-[#F97316]' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                  <span className="text-[#F97316] font-bold">{product.categoryLabel}</span>
                  <span>•</span>
                  <span className="text-gray-600 font-semibold">Nationwide COD (7-10 Working Days)</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h2>

                <div className="pt-1 flex items-baseline space-x-2.5">
                  <span className="text-xl font-extrabold text-[#0B132B]">
                    {formatPKR(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPKR(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-600 font-normal leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Color variant picker */}
              {product.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Finish: <span className="font-normal text-gray-600">{selectedColor.name}</span>
                  </label>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          selectedColor.name === color.name
                            ? 'border-[#F97316] bg-orange-50 text-[#F97316]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size variant picker */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Size: <span className="font-normal text-gray-600">{selectedSize?.name}</span>
                  </label>
                  <div className="flex gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size.name}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          selectedSize?.name === size.name
                            ? 'border-[#F97316] bg-orange-50 text-[#F97316]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-2 shadow-md"
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>ADD TO CART</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist(product.id) ? 'text-rose-500 fill-rose-500' : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center text-xs">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-gray-900 hover:text-[#F97316] flex items-center gap-1 font-bold transition-colors"
                >
                  <span>View Full Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                  <RealisticTruckIcon size={16} />
                  <span>Cash on Delivery (7-10 Working Days)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
