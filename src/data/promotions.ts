import { PromoCode } from '../types';
import promotionsData from './promotions.json';

export const AVAILABLE_PROMOS: Record<string, PromoCode> = promotionsData.promos;
export const STORE_SALE_OFFER = promotionsData.saleOffer;
