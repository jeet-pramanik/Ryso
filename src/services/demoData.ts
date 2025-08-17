import { 
  Transaction, 
  ExpenseCategory, 
  TransactionType, 
  PaymentMethod,
  SavingsGoal,
  GoalCategory,
  GoalStatus,
  GoalTemplate
} from '@/types';

const merchantNames = {
  [ExpenseCategory.FOOD]: [
    'Zomato', 'Swiggy', 'McDonald\'s', 'KFC', 'Pizza Hut', 'Domino\'s',
    'Café Coffee Day', 'Starbucks', 'Subway', 'Burger King', 'Campus Canteen',
    'Street Food Vendor', 'Local Restaurant', 'Mess Hall', 'Food Court'
  ],
  [ExpenseCategory.TRANSPORT]: [
    'Uber', 'Ola', 'Auto Rickshaw', 'Bus Pass', 'Metro Card', 'Train Ticket',
    'Bike Taxi', 'Cab Service', 'Local Bus', 'Share Auto', 'Railway Booking'
  ],
  [ExpenseCategory.HOSTEL]: [
    'Hostel Mess', 'Electricity Bill', 'WiFi Bill', 'Laundry Service',
    'Room Rent', 'Maintenance Fee', 'Water Bill', 'Cleaning Service'
  ],
  [ExpenseCategory.BOOKS]: [
    'Amazon', 'Flipkart', 'College Bookstore', 'Xerox Shop', 'Library Fine',
    'Stationery Shop', 'Online Course', 'Book Depot', 'Study Material'
  ],
  [ExpenseCategory.ENTERTAINMENT]: [
    'PVR Cinemas', 'BookMyShow', 'Netflix', 'Spotify', 'Gaming Store',
    'Mall', 'Bowling Alley', 'Arcade', 'Concert Ticket', 'Event Pass'
  ],
  [ExpenseCategory.EMERGENCY]: [
    'Medical Store', 'Doctor Fee', 'Hospital', 'Pharmacy', 'Emergency Cab',
    'Urgent Repair', 'Emergency Food', 'Health Checkup'
  ]
};

const descriptions = {
  [ExpenseCategory.FOOD]: [
    'Lunch order', 'Dinner with friends', 'Morning coffee', 'Snacks',
    'Birthday treat', 'Late night food', 'Breakfast', 'Weekend meal'
  ],
  [ExpenseCategory.TRANSPORT]: [
    'College commute', 'Home visit', 'Shopping trip', 'Friend\'s place',
    'Exam center', 'Interview travel', 'Hospital visit', 'Market trip'
  ],
  [ExpenseCategory.HOSTEL]: [
    'Monthly mess fee', 'Room cleaning', 'Laundry charges', 'Internet bill',
    'Electricity charge', 'Maintenance', 'Water supply', 'Room repair'
  ],
  [ExpenseCategory.BOOKS]: [
    'Textbook purchase', 'Notes printing', 'Stationery items', 'Lab manual',
    'Assignment materials', 'Study guides', 'Online resources', 'Library fine'
  ],
  [ExpenseCategory.ENTERTAINMENT]: [
    'Movie ticket', 'Music subscription', 'Game purchase', 'Party expenses',
    'Concert ticket', 'Fun activities', 'Weekend entertainment', 'Social event'
  ],
  [ExpenseCategory.EMERGENCY]: [
    'Medical emergency', 'Urgent medicine', 'Doctor consultation', 'Health checkup',
    'Emergency travel', 'Repair costs', 'Urgent supplies', 'Health insurance'
  ]
};

const amountRanges = {
  [ExpenseCategory.FOOD]: { min: 50, max: 500 },
  [ExpenseCategory.TRANSPORT]: { min: 20, max: 300 },
  [ExpenseCategory.HOSTEL]: { min: 100, max: 2000 },
  [ExpenseCategory.BOOKS]: { min: 100, max: 1500 },
  [ExpenseCategory.ENTERTAINMENT]: { min: 100, max: 800 },
  [ExpenseCategory.EMERGENCY]: { min: 200, max: 2000 }
};

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAmount(category: ExpenseCategory): number {
  const range = amountRanges[category];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

function getRandomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export function generateDemoTransactions(userId: string): Transaction[] {
  const transactions: Transaction[] = [];
  const categories = Object.values(ExpenseCategory);
  
  // Generate transactions for the last 30 days
  for (let day = 0; day < 30; day++) {
    // Generate 1-4 transactions per day
    const transactionsPerDay = Math.floor(Math.random() * 4) + 1;
    
    for (let i = 0; i < transactionsPerDay; i++) {
      const category = getRandomItem(categories);
      const merchant = getRandomItem(merchantNames[category]);
      const description = getRandomItem(descriptions[category]);
      const amount = getRandomAmount(category);
      
      // Weekend spending is typically higher
      const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
      const adjustedAmount = isWeekend ? Math.floor(amount * 1.3) : amount;
      
      const transaction: Transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        amount: adjustedAmount,
        description,
        category,
        date: getRandomDate(day),
        type: TransactionType.EXPENSE,
        paymentMethod: getRandomItem([PaymentMethod.UPI, PaymentMethod.CASH, PaymentMethod.CARD]),
        merchantName: merchant,
        upiTransactionId: Math.random() > 0.5 ? `UPI${Date.now()}${Math.random().toString(36).substr(2, 6)}` : undefined,
        createdAt: getRandomDate(day)
      };
      
      transactions.push(transaction);
    }
  }
  
  // Add some income transactions
  for (let i = 0; i < 3; i++) {
    transactions.push({
      id: `income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount: Math.floor(Math.random() * 5000) + 2000,
      description: getRandomItem(['Pocket money', 'Part-time job', 'Freelance work', 'Scholarship']),
      category: ExpenseCategory.EMERGENCY, // Using as placeholder
      date: getRandomDate(Math.floor(Math.random() * 30)),
      type: TransactionType.INCOME,
      paymentMethod: PaymentMethod.UPI,
      createdAt: getRandomDate(Math.floor(Math.random() * 30))
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const goalTemplates: GoalTemplate[] = [
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    description: 'Build a safety net for unexpected expenses',
    targetAmount: 5000,
    suggestedDuration: 90,
    category: GoalCategory.EMERGENCY,
    icon: '🛡️',
    color: 'emergency'
  },
  {
    id: 'internship-prep',
    title: 'Internship Preparation',
    description: 'Save for interview clothes and travel expenses',
    targetAmount: 3000,
    suggestedDuration: 60,
    category: GoalCategory.CAREER,
    icon: '💼',
    color: 'primary'
  },
  {
    id: 'weekend-trip',
    title: 'Weekend Trip',
    description: 'Plan a fun getaway with friends',
    targetAmount: 4000,
    suggestedDuration: 120,
    category: GoalCategory.TRAVEL,
    icon: '🏖️',
    color: 'success'
  },
  {
    id: 'new-laptop',
    title: 'New Laptop',
    description: 'Save for a new laptop for studies',
    targetAmount: 40000,
    suggestedDuration: 180,
    category: GoalCategory.GADGET,
    icon: '💻',
    color: 'transport'
  },
  {
    id: 'birthday-celebration',
    title: 'Birthday Celebration',
    description: 'Plan an amazing birthday party',
    targetAmount: 2500,
    suggestedDuration: 45,
    category: GoalCategory.OTHER,
    icon: '🎉',
    color: 'entertainment'
  }
];

export function generateDemoGoals(userId: string): SavingsGoal[] {
  return [
    {
      id: 'goal_1',
      userId,
      title: 'Emergency Fund',
      description: 'Building a safety net for unexpected expenses',
      targetAmount: 5000,
      currentAmount: 1750,
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      category: GoalCategory.EMERGENCY,
      status: GoalStatus.ACTIVE,
      icon: '🛡️',
      color: 'emergency',
      milestones: [
        { id: 'm1', amount: 1000, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: true },
        { id: 'm2', amount: 2500, date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false },
        { id: 'm3', amount: 5000, date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false }
      ],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'goal_2',
      userId,
      title: 'Weekend Trip',
      description: 'Saving for a trip to Goa with friends',
      targetAmount: 4000,
      currentAmount: 800,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      category: GoalCategory.TRAVEL,
      status: GoalStatus.ACTIVE,
      icon: '🏖️',
      color: 'success',
      milestones: [
        { id: 'm4', amount: 1000, date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false },
        { id: 'm5', amount: 2500, date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false },
        { id: 'm6', amount: 4000, date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), isCompleted: false }
      ],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}