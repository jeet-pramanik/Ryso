export const PAYMENT_CONFIG = {
  MAX_AMOUNT: 50000,
  SUCCESS_RATE_THRESHOLD: 10000, // 95% success below this amount
  SUCCESS_RATE_HIGH: 0.95,
  SUCCESS_RATE_LOW: 0.85,
  PROCESSING_DELAY: 2000,
  UPI_PATTERNS: {
    PAYTM: /@paytm$/,
    GPAY: /@(gpay|googleplay)$/,
    PHONEPE: /@(phonepe|ybl)$/,
    BHIM: /@upi$/
  }
} as const;

export const PAYMENT_STEPS = {
  FORM: 'form',
  VERIFY: 'verify',
  CONFIRM: 'confirm',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

export const QR_SCANNER_CONFIG = {
  MOCK_DELAY: 1500,
  SUCCESS_RATE: 0.9
} as const;
