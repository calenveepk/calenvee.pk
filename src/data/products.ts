import { Product } from '../types';
import productsData from './products.json';

export const PRODUCTS: Product[] = productsData as unknown as Product[];
