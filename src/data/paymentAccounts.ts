export interface PaymentAccountConfig {
  providerName: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  iban?: string;
  raastId?: string;
  instructions: string;
}

/**
 * ==============================================================================
 * CALENVEE PAYMENT ACCOUNTS CONFIGURATION
 * ==============================================================================
 * Edit your JazzCash, EasyPaisa, and Bank details below.
 * Changes here will instantly update the Checkout page and receipt instructions!
 * ==============================================================================
 */
export const PAYMENT_ACCOUNTS: Record<'jazzcash' | 'easypaisa' | 'bank_transfer', PaymentAccountConfig> = {
  jazzcash: {
    providerName: 'JazzCash Mobile Account',
    accountTitle: 'Calenvee Official',
    accountNumber: '03001234567', // <-- Replace with your JazzCash mobile number
    instructions: 'Send payment via JazzCash App / *786# and share the transaction screenshot on WhatsApp.',
  },
  easypaisa: {
    providerName: 'EasyPaisa Mobile Account',
    accountTitle: 'Calenvee Official',
    accountNumber: '03001234567', // <-- Replace with your EasyPaisa mobile number
    instructions: 'Send payment via EasyPaisa App / *786# and share the transaction screenshot on WhatsApp.',
  },
  bank_transfer: {
    providerName: 'Bank Transfer / Raast Instant',
    bankName: 'Meezan Bank Limited', // <-- Your Bank Name
    accountTitle: 'Calenvee Official', // <-- Your Bank Account Title
    accountNumber: '01020304050607', // <-- Your Account Number
    iban: 'PK00MEZN0001020304050607', // <-- Your 24-digit IBAN (optional)
    raastId: '03001234567', // <-- Your Raast registered mobile number (optional)
    instructions: 'Transfer funds via Bank App or Raast Instant ID, then send the receipt slip on WhatsApp.',
  },
};
