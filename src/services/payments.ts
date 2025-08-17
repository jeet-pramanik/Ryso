import { PaymentRequest, PaymentResponse, ExpenseCategory, TransactionType, PaymentMethod } from '@/types';
import { categorizationService } from './categorization';

export interface PaymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration?: number; // in milliseconds
}

export interface PaymentSimulationConfig {
  baseSuccessRate: number; // 0.0 - 1.0
  maxSuccessAmount: number; // Amount below which success rate is highest
  networkDelayRange: [number, number]; // [min, max] in milliseconds
  verificationDelay: number;
  processingDelay: number;
}

export interface UPIContact {
  id: string;
  name: string;
  upiId: string;
  avatar?: string;
  isFavorite: boolean;
  lastUsed?: string;
  transactionCount: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  timestamp: string;
  amount: number;
  recipientUPI: string;
  estimatedCategory?: ExpenseCategory;
  confidence?: number;
}

const DEFAULT_CONFIG: PaymentSimulationConfig = {
  baseSuccessRate: 0.95,
  maxSuccessAmount: 10000,
  networkDelayRange: [500, 2000],
  verificationDelay: 1500,
  processingDelay: 2000
};

/**
 * Advanced UPI Payment Simulation Service
 * Provides realistic payment flow with configurable success rates and delays
 */
export class PaymentService {
  private config: PaymentSimulationConfig;
  private savedContacts: UPIContact[] = [];
  private activePayments = new Map<string, PaymentStep[]>();

  constructor(config: Partial<PaymentSimulationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeSampleContacts();
  }

  private initializeSampleContacts(): void {
    this.savedContacts = [
      {
        id: 'contact-1',
        name: 'Rahul Kumar',
        upiId: 'rahul.kumar@paytm',
        isFavorite: true,
        lastUsed: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        transactionCount: 15
      },
      {
        id: 'contact-2',
        name: 'Priya Sharma',
        upiId: 'priya.sharma@phonepe',
        isFavorite: true,
        lastUsed: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        transactionCount: 8
      },
      {
        id: 'contact-3',
        name: 'Mom',
        upiId: 'mother@googlepay',
        isFavorite: true,
        lastUsed: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        transactionCount: 25
      },
      {
        id: 'contact-4',
        name: 'Roommate - Alex',
        upiId: 'alex.room@paytm',
        isFavorite: false,
        lastUsed: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        transactionCount: 12
      },
      {
        id: 'contact-5',
        name: 'College Canteen',
        upiId: 'canteen@college.edu',
        isFavorite: false,
        lastUsed: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        transactionCount: 45
      }
    ];
  }

  /**
   * Get saved UPI contacts
   */
  getSavedContacts(): UPIContact[] {
    return this.savedContacts.sort((a, b) => {
      // Sort by favorites first, then by last used
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1;
      }
      const aLastUsed = new Date(a.lastUsed || 0).getTime();
      const bLastUsed = new Date(b.lastUsed || 0).getTime();
      return bLastUsed - aLastUsed;
    });
  }

  /**
   * Add or update a UPI contact
   */
  saveContact(contact: Omit<UPIContact, 'id' | 'transactionCount'>): UPIContact {
    const existingIndex = this.savedContacts.findIndex(c => c.upiId === contact.upiId);
    
    if (existingIndex >= 0) {
      // Update existing contact
      const existing = this.savedContacts[existingIndex];
      const updated = {
        ...existing,
        ...contact,
        lastUsed: new Date().toISOString(),
        transactionCount: existing.transactionCount + 1
      };
      this.savedContacts[existingIndex] = updated;
      return updated;
    } else {
      // Add new contact
      const newContact: UPIContact = {
        ...contact,
        id: `contact-${Date.now()}`,
        lastUsed: new Date().toISOString(),
        transactionCount: 1
      };
      this.savedContacts.push(newContact);
      return newContact;
    }
  }

  /**
   * Toggle favorite status of a contact
   */
  toggleFavorite(contactId: string): void {
    const contact = this.savedContacts.find(c => c.id === contactId);
    if (contact) {
      contact.isFavorite = !contact.isFavorite;
    }
  }

  /**
   * Validate UPI ID format
   */
  validateUPIId(upiId: string): { isValid: boolean; error?: string } {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    
    if (!upiId.trim()) {
      return { isValid: false, error: 'UPI ID is required' };
    }
    
    if (!upiRegex.test(upiId)) {
      return { isValid: false, error: 'Invalid UPI ID format' };
    }
    
    return { isValid: true };
  }

  /**
   * Estimate transaction category based on UPI ID and amount
   */
  estimateCategory(upiId: string, amount: number, description?: string): {
    category: ExpenseCategory;
    confidence: number;
  } {
    // Use categorization service if description is provided
    if (description) {
      const result = categorizationService.categorize(description, undefined, upiId);
      return {
        category: result.category,
        confidence: result.confidence
      };
    }

    // UPI-based heuristics
    const lowerUpiId = upiId.toLowerCase();
    
    // Food delivery and restaurant patterns
    if (lowerUpiId.includes('zomato') || lowerUpiId.includes('swiggy') || 
        lowerUpiId.includes('food') || lowerUpiId.includes('canteen') ||
        lowerUpiId.includes('restaurant') || lowerUpiId.includes('cafe')) {
      return { category: ExpenseCategory.FOOD, confidence: 0.85 };
    }
    
    // Transport patterns
    if (lowerUpiId.includes('uber') || lowerUpiId.includes('ola') || 
        lowerUpiId.includes('cab') || lowerUpiId.includes('taxi') ||
        lowerUpiId.includes('transport')) {
      return { category: ExpenseCategory.TRANSPORT, confidence: 0.85 };
    }
    
    // Entertainment patterns
    if (lowerUpiId.includes('netflix') || lowerUpiId.includes('spotify') || 
        lowerUpiId.includes('bookmyshow') || lowerUpiId.includes('pvr') ||
        lowerUpiId.includes('entertainment')) {
      return { category: ExpenseCategory.ENTERTAINMENT, confidence: 0.80 };
    }
    
    // Education/Books patterns
    if (lowerUpiId.includes('amazon') || lowerUpiId.includes('flipkart') || 
        lowerUpiId.includes('book') || lowerUpiId.includes('college') ||
        lowerUpiId.includes('edu')) {
      return { category: ExpenseCategory.BOOKS, confidence: 0.70 };
    }
    
    // Medical patterns
    if (lowerUpiId.includes('hospital') || lowerUpiId.includes('medic') || 
        lowerUpiId.includes('pharma') || lowerUpiId.includes('health')) {
      return { category: ExpenseCategory.EMERGENCY, confidence: 0.75 };
    }
    
    // Amount-based heuristics
    if (amount >= 1000) {
      return { category: ExpenseCategory.HOSTEL, confidence: 0.40 };
    } else if (amount <= 50) {
      return { category: ExpenseCategory.FOOD, confidence: 0.50 };
    } else if (amount <= 200) {
      return { category: ExpenseCategory.TRANSPORT, confidence: 0.45 };
    }
    
    // Default to food for small amounts
    return { category: ExpenseCategory.FOOD, confidence: 0.30 };
  }

  /**
   * Calculate payment success probability
   */
  private calculateSuccessRate(amount: number): number {
    const { baseSuccessRate, maxSuccessAmount } = this.config;
    
    if (amount <= maxSuccessAmount) {
      return baseSuccessRate;
    }
    
    // Gradually decrease success rate for larger amounts
    const excessAmount = amount - maxSuccessAmount;
    const penaltyFactor = Math.min(excessAmount / 50000, 0.3); // Max 30% penalty
    
    return Math.max(baseSuccessRate - penaltyFactor, 0.6); // Minimum 60% success rate
  }

  /**
   * Generate payment steps for tracking
   */
  private generatePaymentSteps(paymentId: string): PaymentStep[] {
    return [
      {
        id: `${paymentId}-enter`,
        title: 'Enter Details',
        description: 'Entering payment information',
        status: 'completed'
      },
      {
        id: `${paymentId}-verify`,
        title: 'Verify Recipient',
        description: 'Verifying UPI ID and recipient details',
        status: 'active',
        duration: this.config.verificationDelay
      },
      {
        id: `${paymentId}-processing`,
        title: 'Processing Payment',
        description: 'Processing your transaction',
        status: 'pending',
        duration: this.config.processingDelay
      },
      {
        id: `${paymentId}-completion`,
        title: 'Completion',
        description: 'Payment completed successfully',
        status: 'pending'
      }
    ];
  }

  /**
   * Start payment process and return step tracker
   */
  async initiatePayment(request: PaymentRequest): Promise<{
    paymentId: string;
    steps: PaymentStep[];
  }> {
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const steps = this.generatePaymentSteps(paymentId);
    
    this.activePayments.set(paymentId, steps);
    
    return { paymentId, steps };
  }

  /**
   * Get current payment steps
   */
  getPaymentSteps(paymentId: string): PaymentStep[] | null {
    return this.activePayments.get(paymentId) || null;
  }

  /**
   * Simulate payment verification step
   */
  async verifyRecipient(paymentId: string, upiId: string): Promise<{
    success: boolean;
    recipientName?: string;
    error?: string;
  }> {
    const steps = this.activePayments.get(paymentId);
    if (!steps) {
      throw new Error('Payment not found');
    }

    // Update verification step to processing
    const verifyStep = steps.find(s => s.id.includes('verify'));
    if (verifyStep) {
      verifyStep.status = 'active';
    }

    // Simulate network delay
    await new Promise(resolve => 
      setTimeout(resolve, this.config.verificationDelay)
    );

    // Simulate verification result
    const validation = this.validateUPIId(upiId);
    if (!validation.isValid) {
      if (verifyStep) {
        verifyStep.status = 'error';
      }
      return {
        success: false,
        error: validation.error
      };
    }

    // 95% chance of successful verification for valid UPI IDs
    const isVerified = Math.random() < 0.95;
    
    if (verifyStep) {
      verifyStep.status = isVerified ? 'completed' : 'error';
    }

    if (isVerified) {
      // Move to processing step
      const processingStep = steps.find(s => s.id.includes('processing'));
      if (processingStep) {
        processingStep.status = 'active';
      }

      // Generate recipient name based on UPI ID
      const recipientName = this.generateRecipientName(upiId);
      
      return {
        success: true,
        recipientName
      };
    } else {
      return {
        success: false,
        error: 'Unable to verify recipient. Please check UPI ID.'
      };
    }
  }

  /**
   * Process the actual payment
   */
  async processPayment(paymentId: string, request: PaymentRequest): Promise<PaymentResult> {
    const steps = this.activePayments.get(paymentId);
    if (!steps) {
      throw new Error('Payment not found');
    }

    const processingStep = steps.find(s => s.id.includes('processing'));
    if (processingStep) {
      processingStep.status = 'active';
    }

    // Simulate processing delay
    await new Promise(resolve => 
      setTimeout(resolve, this.config.processingDelay)
    );

    const successRate = this.calculateSuccessRate(request.amount);
    const isSuccessful = Math.random() < successRate;
    
    const completionStep = steps.find(s => s.id.includes('completion'));
    
    if (isSuccessful) {
      if (processingStep) processingStep.status = 'completed';
      if (completionStep) completionStep.status = 'completed';

      // Save/update contact
      this.saveContact({
        name: this.generateRecipientName(request.recipientUPI),
        upiId: request.recipientUPI,
        isFavorite: false
      });

      // Estimate category for auto-transaction creation
      const categoryEstimate = this.estimateCategory(
        request.recipientUPI, 
        request.amount, 
        request.description
      );

      const result: PaymentResult = {
        success: true,
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        message: 'Payment completed successfully',
        timestamp: new Date().toISOString(),
        amount: request.amount,
        recipientUPI: request.recipientUPI,
        estimatedCategory: categoryEstimate.category,
        confidence: categoryEstimate.confidence
      };

      // Clean up active payment
      this.activePayments.delete(paymentId);
      
      return result;
    } else {
      if (processingStep) processingStep.status = 'error';
      if (completionStep) completionStep.status = 'error';

      const result: PaymentResult = {
        success: false,
        message: this.generateFailureMessage(request.amount),
        timestamp: new Date().toISOString(),
        amount: request.amount,
        recipientUPI: request.recipientUPI
      };

      // Clean up active payment
      this.activePayments.delete(paymentId);
      
      return result;
    }
  }

  /**
   * Generate realistic recipient name from UPI ID
   */
  private generateRecipientName(upiId: string): string {
    const names = [
      'Rahul Kumar', 'Priya Sharma', 'Amit Singh', 'Sneha Patel',
      'Vikash Gupta', 'Anita Yadav', 'Rohit Verma', 'Kavya Reddy',
      'Arjun Mehta', 'Pooja Jain', 'Suresh Kumar', 'Neha Agarwal'
    ];
    
    // Check if it's a business/service UPI
    const lowerUpiId = upiId.toLowerCase();
    if (lowerUpiId.includes('zomato')) return 'Zomato';
    if (lowerUpiId.includes('swiggy')) return 'Swiggy';
    if (lowerUpiId.includes('uber')) return 'Uber';
    if (lowerUpiId.includes('ola')) return 'Ola Cabs';
    if (lowerUpiId.includes('canteen')) return 'College Canteen';
    if (lowerUpiId.includes('hospital')) return 'Hospital';
    if (lowerUpiId.includes('mother') || lowerUpiId.includes('mom')) return 'Mom';
    
    // Generate based on UPI ID hash for consistency
    const hash = upiId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return names[Math.abs(hash) % names.length];
  }

  /**
   * Generate realistic failure messages
   */
  private generateFailureMessage(amount: number): string {
    const messages = [
      'Transaction failed due to insufficient balance',
      'Payment declined by bank. Please try again.',
      'UPI service temporarily unavailable',
      'Transaction limit exceeded for today',
      'Network error. Please check your connection.',
      'Payment gateway timeout. Please retry.',
      'Invalid transaction. Contact your bank.'
    ];
    
    // Higher amounts more likely to fail due to limits
    if (amount > 25000) {
      return 'Transaction limit exceeded for today';
    } else if (amount > 15000) {
      return 'Payment declined by bank. Please try again.';
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Update payment service configuration
   */
  updateConfig(newConfig: Partial<PaymentSimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): PaymentSimulationConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const paymentService = new PaymentService();
