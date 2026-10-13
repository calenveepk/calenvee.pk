/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOPIFY_STORE_DOMAIN: string;
  readonly VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN: string;
  readonly VITE_SHOPIFY_API_VERSION: string;
  readonly VITE_USE_SHOPIFY_API: string;
  readonly VITE_STORE_NAME: string;
  readonly VITE_STORE_EMAIL: string;
  readonly VITE_STORE_INSTAGRAM: string;
  readonly VITE_STORE_FACEBOOK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

