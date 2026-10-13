import accountsData from './paymentAccounts.json';

export interface PaymentAccountConfig {
  providerName: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  iban?: string;
  raastId?: string;
  instructions: string;
}

export const PAYMENT_ACCOUNTS: Record<'jazzcash' | 'easypaisa' | 'bank_transfer', PaymentAccountConfig> = accountsData;
