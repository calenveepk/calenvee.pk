export interface ProductReview {
  id: string;
  author: string;
  university: string;
  verifiedBuyer: boolean;
  rating: number;
  date: string;
  title: string;
  comment: string;
  helpfulCount: number;
  images?: string[];
}

export interface ProductVariantColor {
  name: string;
  hex: string;
  inStock: boolean;
}

export interface ProductVariantSize {
  name: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryLabel: string;
  subcategory?: string;
  gender?: 'men' | 'women' | 'unisex';
  seoKeywords?: string[];
  price: number; // in PKR
  originalPrice: number; // in PKR
  discountPercentage: number;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  isNewDrop?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  tags: string[];
  images: string[];
  description: string;
  shortDescription: string;
  specifications: Record<string, string>;
  colors: ProductVariantColor[];
  sizes?: ProductVariantSize[];
  universityPick?: string;
  material?: string;
  warranty?: string;
  reviews: ProductReview[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  badge?: string;
  itemCount: number;
  featured?: boolean;
  seoKeywords: string[];
}

export interface CartItem {
  id: string; // unique item id composed of product.id + color + size
  product: Product;
  selectedColor: ProductVariantColor;
  selectedSize?: ProductVariantSize;
  quantity: number;
}

export interface PromoCode {
  code: string;
  discountPercentage: number;
  minOrderValue: number;
  description: string;
}

export interface OrderDetails {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  city: string;
  university?: string;
  address: string;
  postalCode?: string;
  notes?: string;
  paymentMethod: 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer';
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  promoCode?: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  trackingNumber: string;
  courier: string;
  createdAt: string;
  receiptImage?: string;
  receiptFileName?: string;
  receiptFileSize?: string;
}

export interface ShopifyConfig {
  storeDomain: string;
  storefrontAccessToken: string;
  apiVersion: string;
  useLiveApi: boolean;
}

