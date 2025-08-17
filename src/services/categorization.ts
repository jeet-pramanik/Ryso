import { ExpenseCategory } from '@/types';
import { CATEGORY_CONFIG } from '@/constants/categories';

export interface CategorizationResult {
  category: ExpenseCategory;
  confidence: number;
  reason: string;
  isManual: boolean;
}

export interface CategorizationRule {
  keywords: readonly string[];
  category: ExpenseCategory;
  weight: number;
  pattern?: RegExp;
}

/**
 * Auto-categorization engine for transactions
 * Uses keyword matching, pattern recognition, and UPI description parsing
 */
export class CategorizationService {
  private rules: CategorizationRule[] = [];
  private upiPatterns: Map<RegExp, ExpenseCategory> = new Map();
  
  constructor() {
    this.initializeRules();
    this.initializeUpiPatterns();
  }

  private initializeRules(): void {
    // Base rules from category configuration
    Object.entries(CATEGORY_CONFIG).forEach(([category, config]) => {
      this.rules.push({
        keywords: config.keywords,
        category: category as ExpenseCategory,
        weight: 1.0
      });
    });

    // Enhanced merchant-specific rules with higher weights
    this.rules.push(
      // Food delivery apps (high confidence)
      {
        keywords: ['zomato', 'swiggy', 'dunzo', 'ubereats'],
        category: ExpenseCategory.FOOD,
        weight: 2.0
      },
      // Transport apps (high confidence)
      {
        keywords: ['uber', 'ola', 'rapido', 'namma yatri'],
        category: ExpenseCategory.TRANSPORT,
        weight: 2.0
      },
      // E-commerce for books (high confidence)
      {
        keywords: ['amazon books', 'flipkart books', 'bookstore'],
        category: ExpenseCategory.BOOKS,
        weight: 2.0
      },
      // Entertainment platforms (high confidence)
      {
        keywords: ['netflix', 'spotify', 'prime video', 'hotstar', 'bookmyshow'],
        category: ExpenseCategory.ENTERTAINMENT,
        weight: 2.0
      },
      // Medical/Emergency (high confidence)
      {
        keywords: ['apollo', 'medplus', 'netmeds', '1mg', 'hospital'],
        category: ExpenseCategory.EMERGENCY,
        weight: 2.0
      },
      // Hostel/Accommodation (high confidence)
      {
        keywords: ['mess fee', 'hostel rent', 'accommodation', 'pg rent'],
        category: ExpenseCategory.HOSTEL,
        weight: 2.0
      }
    );
  }

  private initializeUpiPatterns(): void {
    // UPI handle patterns for common merchants
    this.upiPatterns.set(/zomato.*@paytm/i, ExpenseCategory.FOOD);
    this.upiPatterns.set(/swiggy.*@paytm/i, ExpenseCategory.FOOD);
    this.upiPatterns.set(/uber.*@paytm/i, ExpenseCategory.TRANSPORT);
    this.upiPatterns.set(/ola.*@paytm/i, ExpenseCategory.TRANSPORT);
    this.upiPatterns.set(/netflix.*@paytm/i, ExpenseCategory.ENTERTAINMENT);
    this.upiPatterns.set(/spotify.*@paytm/i, ExpenseCategory.ENTERTAINMENT);
    this.upiPatterns.set(/amazon.*@paytm/i, ExpenseCategory.BOOKS);
    this.upiPatterns.set(/flipkart.*@paytm/i, ExpenseCategory.BOOKS);
    this.upiPatterns.set(/.*mess.*@paytm/i, ExpenseCategory.HOSTEL);
    this.upiPatterns.set(/.*hospital.*@paytm/i, ExpenseCategory.EMERGENCY);
  }

  /**
   * Categorize a transaction based on description and merchant info
   */
  public categorize(
    description: string,
    merchantName?: string,
    upiTransactionId?: string
  ): CategorizationResult {
    const text = `${description} ${merchantName || ''} ${upiTransactionId || ''}`.toLowerCase();
    
    // First try UPI pattern matching (highest confidence)
    if (upiTransactionId) {
      const upiCategory = this.matchUpiPattern(upiTransactionId);
      if (upiCategory) {
        return {
          category: upiCategory,
          confidence: 0.95,
          reason: 'UPI handle pattern match',
          isManual: false
        };
      }
    }

    // Score all categories based on keyword matches
    const scores = this.calculateCategoryScores(text);
    
    // Find the best match
    const bestMatch = Object.entries(scores).reduce((best, [category, score]) => {
      return score > best.score ? { category: category as ExpenseCategory, score } : best;
    }, { category: ExpenseCategory.FOOD, score: 0 });

    // Determine confidence level
    let confidence = this.calculateConfidence(bestMatch.score, scores);
    let reason = this.generateReason(text, bestMatch.category, bestMatch.score);

    // Fallback to food category if confidence is too low
    if (confidence < 0.3) {
      confidence = 0.3;
      reason = 'Default category (low confidence match)';
    }

    return {
      category: bestMatch.category,
      confidence,
      reason,
      isManual: false
    };
  }

  /**
   * Re-categorize existing transactions (batch operation)
   */
  public batchCategorize(
    transactions: Array<{
      id: string;
      description: string;
      merchantName?: string;
      upiTransactionId?: string;
      isManualCategory?: boolean;
    }>
  ): Array<{ id: string; result: CategorizationResult }> {
    return transactions
      .filter(tx => !tx.isManualCategory) // Don't override manual categorizations
      .map(tx => ({
        id: tx.id,
        result: this.categorize(tx.description, tx.merchantName, tx.upiTransactionId)
      }));
  }

  /**
   * Add or update a custom categorization rule
   */
  public addCustomRule(rule: CategorizationRule): void {
    this.rules.push(rule);
  }

  /**
   * Get categorization confidence for debugging
   */
  public getCategorizationDebug(
    description: string,
    merchantName?: string,
    upiTransactionId?: string
  ): {
    text: string;
    scores: Record<ExpenseCategory, number>;
    matchedKeywords: string[];
    result: CategorizationResult;
  } {
    const text = `${description} ${merchantName || ''} ${upiTransactionId || ''}`.toLowerCase();
    const scores = this.calculateCategoryScores(text);
    const matchedKeywords = this.getMatchedKeywords(text);
    const result = this.categorize(description, merchantName, upiTransactionId);

    return {
      text,
      scores,
      matchedKeywords,
      result
    };
  }

  private matchUpiPattern(upiTransactionId: string): ExpenseCategory | null {
    for (const [pattern, category] of this.upiPatterns) {
      if (pattern.test(upiTransactionId)) {
        return category;
      }
    }
    return null;
  }

  private calculateCategoryScores(text: string): Record<ExpenseCategory, number> {
    const scores: Record<ExpenseCategory, number> = {
      [ExpenseCategory.FOOD]: 0,
      [ExpenseCategory.TRANSPORT]: 0,
      [ExpenseCategory.HOSTEL]: 0,
      [ExpenseCategory.BOOKS]: 0,
      [ExpenseCategory.ENTERTAINMENT]: 0,
      [ExpenseCategory.EMERGENCY]: 0
    };

    // Score based on keyword matches
    this.rules.forEach(rule => {
      const keywordMatches = rule.keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        // Score = (number of matched keywords / total keywords) * weight
        const score = (keywordMatches.length / rule.keywords.length) * rule.weight;
        scores[rule.category] += score;
      }
    });

    return scores;
  }

  private calculateConfidence(bestScore: number, allScores: Record<ExpenseCategory, number>): number {
    const totalScore = Object.values(allScores).reduce((sum, score) => sum + score, 0);
    
    if (totalScore === 0) return 0.3; // Default low confidence
    
    const confidence = bestScore / totalScore;
    
    // Boost confidence for clear winners
    if (bestScore > 1.5) return Math.min(0.95, confidence * 1.2);
    if (bestScore > 1.0) return Math.min(0.85, confidence * 1.1);
    
    return Math.max(0.3, Math.min(0.8, confidence));
  }

  private generateReason(text: string, category: ExpenseCategory, score: number): string {
    const matchedKeywords = this.getMatchedKeywords(text)
      .filter(keyword => {
        const relevantRules = this.rules.filter(rule => 
          rule.category === category && rule.keywords.includes(keyword)
        );
        return relevantRules.length > 0;
      });

    if (matchedKeywords.length > 0) {
      return `Matched keywords: ${matchedKeywords.slice(0, 3).join(', ')}`;
    }

    if (score > 0.5) {
      return `Category pattern match (score: ${score.toFixed(2)})`;
    }

    return 'Weak pattern match';
  }

  private getMatchedKeywords(text: string): string[] {
    const matched: string[] = [];
    
    this.rules.forEach(rule => {
      rule.keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase()) && !matched.includes(keyword)) {
          matched.push(keyword);
        }
      });
    });

    return matched;
  }

  /**
   * Parse UPI transaction description for merchant info
   */
  public parseUpiDescription(description: string): {
    merchantName?: string;
    transactionType?: string;
    amount?: number;
  } {
    // Common UPI description patterns
    const patterns = [
      /to\s+([^-\s]+)/i, // "UPI-ZOMATO-123 to MERCHANT"
      /([A-Z]+)\s*-/i,   // "SWIGGY-123-..."
      /UPI-([^-\s]+)/i   // "UPI-MERCHANT-..."
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return {
          merchantName: match[1].trim(),
          transactionType: 'UPI'
        };
      }
    }

    return {};
  }
}

// Singleton instance
export const categorizationService = new CategorizationService();
