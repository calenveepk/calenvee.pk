export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
}

export function calculateSavings(originalPrice: number, currentPrice: number): number {
  return Math.max(0, originalPrice - currentPrice);
}

export function generateOrderId(): string {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `CV-${randomSuffix}`;
}

export function generateTrackingNumber(courier: string = 'TCS Express'): string {
  const prefix = courier.includes('TCS') ? 'TCS' : courier.includes('Trax') ? 'TRX' : 'CAL';
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}-${num}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Peshawar',
  'Multan',
  'Gujranwala',
  'Sialkot',
  'Quetta',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Wah Cantt',
  'Sukkur',
  'Other City',
];

import storeSettingsData from '../data/storeSettings.json';

export const PHYSICAL_STORE_LOCATION = {
  address: storeSettingsData.address || "Online E-Commerce Store — Serving All Pakistan Cities",
  city: storeSettingsData.city || "Pakistan",
  province: "Pakistan",
  country: storeSettingsData.country || "Pakistan",
  whatsappNumber: storeSettingsData.whatsappNumber || "+923001234567",
  whatsappRaw: storeSettingsData.whatsappRaw || "923001234567",
  instagram: storeSettingsData.instagram || "@calenvee.pk",
  facebook: "calenvee.pk",
  expectedDeliveryDays: "7-10 Days",
  slogan: storeSettingsData.storeSlogan || "SHOP SMART, LIVE BETTER",
};

export const STORE_INFO = PHYSICAL_STORE_LOCATION;
