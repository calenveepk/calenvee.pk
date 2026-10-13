import { Product, Category, ShopifyConfig } from '../types';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';

// Shopify Storefront API Adapter
const shopifyConfig: ShopifyConfig = {
  storeDomain: import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || 'calenvee.myshopify.com',
  storefrontAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
  apiVersion: import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-01',
  useLiveApi: import.meta.env.VITE_USE_SHOPIFY_API === 'true',
};

async function shopifyFetch<T>(query: string, variables: Record<string, any> = {}): Promise<T | null> {
  if (!shopifyConfig.useLiveApi || !shopifyConfig.storefrontAccessToken) {
    return null;
  }

  const endpoint = `https://${shopifyConfig.storeDomain}/api/${shopifyConfig.apiVersion}/graphql.json`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      console.warn(`Shopify API responded with status ${res.status}. Falling back to local data.`);
      return null;
    }

    const json = await res.json();
    return json.data as T;
  } catch (error) {
    console.warn('Shopify API connection failed. Using local catalog fallback.', error);
    return null;
  }
}

/**
 * Fetch all products, seamlessly switching between Shopify GraphQL Storefront API and local catalog
 */
export async function getProducts(): Promise<Product[]> {
  if (shopifyConfig.useLiveApi && shopifyConfig.storefrontAccessToken) {
    const query = `
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              availableForSale
              totalInventory
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              compareAtPriceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              tags
              productType
            }
          }
        }
      }
    `;

    interface ShopifyResponse {
      products: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            handle: string;
            description: string;
            availableForSale: boolean;
            totalInventory?: number;
            priceRange: { minVariantPrice: { amount: string } };
            compareAtPriceRange?: { minVariantPrice: { amount: string } };
            images: { edges: Array<{ node: { url: string } }> };
            tags: string[];
            productType: string;
          };
        }>;
      };
    }

    const data = await shopifyFetch<ShopifyResponse>(query, { first: 50 });
    if (data?.products?.edges?.length) {
      return data.products.edges.map(({ node }) => {
        const price = Math.round(parseFloat(node.priceRange.minVariantPrice.amount));
        const originalPrice = node.compareAtPriceRange?.minVariantPrice?.amount
          ? Math.round(parseFloat(node.compareAtPriceRange.minVariantPrice.amount))
          : Math.round(price * 1.3);

        const discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);

        return {
          id: node.id,
          name: node.title,
          slug: node.handle,
          category: (node.productType.toLowerCase() as any) || 'jewelry',
          categoryLabel: node.productType || 'Accessories',
          price,
          originalPrice,
          discountPercentage,
          rating: 4.9,
          reviewsCount: 35,
          inStock: node.availableForSale,
          stockCount: node.totalInventory ?? 20,
          tags: node.tags,
          images: node.images.edges.map((img) => img.node.url),
          description: node.description,
          shortDescription: node.description.slice(0, 120) + '...',
          specifications: {
            'Source': 'Shopify Official Storefront',
          },
          colors: [{ name: 'Default', hex: '#000000', inStock: true }],
          reviews: [],
        };
      });
    }
  }

  // Local catalog default fallback
  return PRODUCTS;
}

/**
 * Fetch a single product by slug or ID
 */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug || p.id === slug);
}

/**
 * Fetch collections / categories
 */
export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

/**
 * Shopify Checkout Integration Helper
 */
export async function createShopifyCheckout(lineItems: Array<{ variantId: string; quantity: number }>): Promise<string | null> {
  if (!shopifyConfig.useLiveApi || !shopifyConfig.storefrontAccessToken) {
    return null;
  }

  const mutation = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
        }
        checkoutUserErrors {
          message
          field
        }
      }
    }
  `;

  interface CheckoutResponse {
    checkoutCreate: {
      checkout: {
        id: string;
        webUrl: string;
      };
      checkoutUserErrors: Array<{ message: string }>;
    };
  }

  const data = await shopifyFetch<CheckoutResponse>(mutation, {
    input: { lineItems },
  });

  return data?.checkoutCreate?.checkout?.webUrl || null;
}

