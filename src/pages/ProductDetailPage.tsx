import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { ProductVariantColor, ProductVariantSize } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/products/ProductCard';
import { ProductGrid } from '../components/products/ProductGrid';
import { formatPKR } from '../utils/formatters';
import { SEO } from '../components/common/SEO';
import {
  RealisticTruckIcon,
  RealisticShieldIcon,
} from '../components/common/RealisticIcons';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-screen py-24 text-center px-4 bg-white text-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Piece Not Found</h1>
        <p className="text-gray-500 text-xs mb-6">The requested piece is no longer available.</p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-colors"
        >
          <span>Explore All Collections</span>
        </Link>
      </div>
    );
  }

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ProductVariantColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<ProductVariantSize | undefined>(
    product.sizes ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const { addItem, setIsOpen: setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, selectedColor, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2400);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const productKeywords = [
    product.name,
    product.categoryLabel,
    product.subcategory,
    ...(product.seoKeywords || []),
    ...(product.tags || []),
    'Calenvee',
    'Calenvee.pk',
    'buy online Pakistan',
    'Cash on Delivery Pakistan',
  ].filter(Boolean).join(', ');

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.shortDescription || product.description,
    sku: product.id.toUpperCase(),
    brand: {
      '@type': 'Brand',
      name: 'Calenvee',
    },
    offers: {
      '@type': 'Offer',
      url: `https://calenvee.pk/product/${product.slug}`,
      priceCurrency: 'PKR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Calenvee.pk',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (product.rating || 5).toString(),
      reviewCount: (product.reviewsCount || 120).toString(),
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <div className="min-h-screen py-4 sm:py-10 bg-white text-gray-900 pb-28 lg:pb-12">
      <SEO
        title={`${product.name} | Calenvee.pk`}
        description={product.shortDescription || product.description}
        keywords={productKeywords}
        image={product.images[0]}
        url={`https://calenvee.pk/product/${product.slug}`}
        type="product"
        schema={productSchema}
      />

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 pb-2.5 mb-2 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#F97316] transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category}`} className="hover:text-[#F97316] transition-colors">
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 bg-white p-3.5 sm:p-10 rounded-xl sm:rounded-2xl border border-gray-100 sm:border-gray-200 shadow-xs sm:shadow-sm">
          {/* Left: Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="aspect-[4/5] sm:aspect-square w-full rounded-xl overflow-hidden bg-gray-50 relative border border-gray-100 flex items-center justify-center">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-2 sm:p-6"
              />
              {product.discountPercentage > 0 && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#F97316] text-white rounded shadow-xs">
                    Save {product.discountPercentage}%
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all bg-gray-50 ${
                      activeImageIndex === idx
                        ? 'border-[#F97316] shadow-sm'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Buy Box & Specifications (5 cols) */}
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category & Title */}
              <div className="space-y-1.5 border-b border-gray-100 pb-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F97316]">
                    {product.categoryLabel}
                  </span>

                  <button
                    onClick={handleShare}
                    className="p-1.5 text-gray-500 hover:text-black rounded-lg transition-colors relative"
                    title="Share piece"
                  >
                    <Share2 className="w-4 h-4" />
                    {copiedLink && (
                      <span className="absolute -bottom-6 right-0 text-[10px] bg-gray-900 text-white font-bold px-2 py-0.5 rounded whitespace-nowrap">
                        Link copied
                      </span>
                    )}
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] leading-tight">
                  {product.name}
                </h1>

                {/* Delivery Assurance */}
                <div className="flex items-center space-x-2 text-xs pt-1 text-gray-500">
                  <span className="font-semibold text-gray-800">Nationwide Cash on Delivery (7-10 Working Days)</span>
                  <span>•</span>
                  <span>7-Day Replacement Guarantee</span>
                </div>

                {/* Price */}
                <div className="pt-2 flex items-baseline space-x-3">
                  <span className="text-2xl font-extrabold text-[#0B132B]">
                    {formatPKR(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPKR(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed">
                {product.description}
              </p>

              {/* Color variant selector */}
              {product.colors.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase tracking-wider text-gray-800">
                      Finish:
                    </span>
                    <span className="text-[#F97316] font-medium">{selectedColor.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                          selectedColor.name === color.name
                            ? 'border-[#F97316] bg-orange-50 text-[#F97316] shadow-xs'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase tracking-wider text-gray-800">
                      Select Size:
                    </span>
                    <span className="text-[#F97316] font-medium">{selectedSize?.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size.name}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl border text-xs font-medium transition-all ${
                          selectedSize?.name === size.name
                            ? 'border-[#F97316] bg-orange-50 text-[#F97316] shadow-xs'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Actions */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 px-6 font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center space-x-2 shadow-md active:scale-98 ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#F97316] hover:bg-[#EA580C] text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>ADDED TO BAG!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-white" />
                        <span>ADD TO CART</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className="p-3.5 rounded-lg border border-gray-200 hover:border-[#F97316] bg-white text-gray-600 hover:text-red-500 transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs text-gray-600 font-normal">
                  <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <RealisticTruckIcon size={18} />
                    <span>COD: 7-10 Working Days Delivery</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <RealisticShieldIcon size={18} />
                    <span>100% Quality Guarantee</span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              {product.specifications && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Specifications
                  </h3>
                  <div className="rounded-lg bg-gray-50 border border-gray-200 overflow-hidden text-xs">
                    {Object.entries(product.specifications).map(([key, val], idx) => (
                      <div
                        key={key}
                        className={`flex justify-between px-3.5 py-2 ${
                          idx % 2 === 0 ? 'bg-white' : ''
                        }`}
                      >
                        <span className="text-gray-500">{key}</span>
                        <span className="text-gray-900 font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Pieces — Centered */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-100 space-y-5">
            <div className="space-y-2 border-b border-gray-100 pb-5 text-center flex flex-col items-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0B132B] uppercase tracking-wider">
                YOU MAY ALSO LIKE
                <span className="block w-16 h-1 bg-[#F97316] mx-auto mt-2 rounded-full" />
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto font-normal leading-relaxed pt-0.5">
                Curated companion pieces designed to complement your selection.
              </p>
            </div>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </div>

      {/* Sticky Mobile Conversion Bar — Sits conveniently right above mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3.5 py-2.5 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-[11px] text-gray-500 font-semibold truncate max-w-[160px]">
            {product.name}
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-sm font-black text-[#0B132B]">
              {formatPKR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] text-gray-400 line-through">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md active:scale-95 flex items-center space-x-1.5 shrink-0 cursor-pointer ${
            isAdded ? 'bg-emerald-600' : 'bg-[#F97316] hover:bg-[#EA580C]'
          }`}
        >
          {isAdded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>Order with COD</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Added to Bag Pill */}
      {isAdded && (
        <div className="fixed bottom-28 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0B132B] text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">Added to Bag</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="text-xs font-bold text-[#F97316] hover:underline uppercase tracking-wide ml-1 cursor-pointer"
          >
            View Bag →
          </button>
        </div>
      )}
    </div>
  );
};
