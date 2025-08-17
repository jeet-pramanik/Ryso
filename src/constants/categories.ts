import { ExpenseCategory } from '@/types';

export const CATEGORY_CONFIG = {
  [ExpenseCategory.FOOD]: {
    name: 'Food',
    icon: '🍕',
    color: '#F59E0B',
    keywords: ['zomato', 'swiggy', 'mcdonald', 'kfc', 'pizza', 'domino', 'cafe', 'starbucks', 'subway', 'burger', 'canteen', 'food', 'restaurant', 'mess', 'lunch', 'dinner', 'breakfast']
  },
  [ExpenseCategory.TRANSPORT]: {
    name: 'Transport',
    icon: '🚕',
    color: '#0D94FB',
    keywords: ['uber', 'ola', 'auto', 'bus', 'metro', 'train', 'cab', 'taxi', 'rickshaw', 'bike', 'railway', 'transport', 'travel', 'commute']
  },
  [ExpenseCategory.HOSTEL]: {
    name: 'Hostel',
    icon: '🏠',
    color: '#7C3AED',
    keywords: ['hostel', 'mess', 'electricity', 'wifi', 'laundry', 'room', 'rent', 'maintenance', 'water', 'cleaning']
  },
  [ExpenseCategory.BOOKS]: {
    name: 'Books',
    icon: '📚',
    color: '#10B981',
    keywords: ['amazon', 'flipkart', 'bookstore', 'xerox', 'library', 'stationery', 'course', 'book', 'study', 'material', 'notes', 'printing']
  },
  [ExpenseCategory.ENTERTAINMENT]: {
    name: 'Entertainment',
    icon: '🎬',
    color: '#EC4899',
    keywords: ['pvr', 'bookmyshow', 'netflix', 'spotify', 'gaming', 'mall', 'bowling', 'arcade', 'concert', 'event', 'movie', 'cinema', 'party']
  },
  [ExpenseCategory.EMERGENCY]: {
    name: 'Emergency',
    icon: '🚨',
    color: '#EF4444',
    keywords: ['medical', 'doctor', 'hospital', 'pharmacy', 'emergency', 'urgent', 'repair', 'health', 'medicine', 'checkup']
  }
} as const;

export const DEFAULT_CATEGORY_BUDGETS = {
  [ExpenseCategory.FOOD]: 3000,
  [ExpenseCategory.TRANSPORT]: 1000,
  [ExpenseCategory.HOSTEL]: 2000,
  [ExpenseCategory.BOOKS]: 800,
  [ExpenseCategory.ENTERTAINMENT]: 1000,
  [ExpenseCategory.EMERGENCY]: 500
} as const;
