import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransactionStore } from '@/stores/transactionStore';
import { ExpenseCategory, TransactionType } from '@/types';
import { cn } from '@/lib/utils';

const categoryIcons = {
  [ExpenseCategory.FOOD]: '🍕',
  [ExpenseCategory.TRANSPORT]: '🚕',
  [ExpenseCategory.HOSTEL]: '🏠',
  [ExpenseCategory.BOOKS]: '📚',
  [ExpenseCategory.ENTERTAINMENT]: '🎬',
  [ExpenseCategory.EMERGENCY]: '🚨'
};

const categoryColors = {
  [ExpenseCategory.FOOD]: 'category-food',
  [ExpenseCategory.TRANSPORT]: 'category-transport',
  [ExpenseCategory.HOSTEL]: 'category-hostel',
  [ExpenseCategory.BOOKS]: 'category-books',
  [ExpenseCategory.ENTERTAINMENT]: 'category-entertainment',
  [ExpenseCategory.EMERGENCY]: 'category-emergency'
};

interface RecentTransactionsProps {
  onViewAll: () => void;
}

export default function RecentTransactions({ onViewAll }: RecentTransactionsProps) {
  const { transactions } = useTransactionStore();
  
  // Get recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (recentTransactions.length === 0) {
    return (
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No transactions yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start by adding your first expense!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {recentTransactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            variants={itemVariants}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
          >
            {/* Category Icon */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-lg border",
              categoryColors[transaction.category]
            )}>
              {categoryIcons[transaction.category]}
            </div>
            
            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {transaction.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDate(transaction.date)}</span>
                <span>•</span>
                <span className="capitalize">{transaction.category.toLowerCase()}</span>
              </div>
            </div>
            
            {/* Amount and Type */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className={cn(
                  "font-semibold",
                  transaction.type === TransactionType.EXPENSE 
                    ? "text-destructive" 
                    : "text-success"
                )}>
                  {transaction.type === TransactionType.EXPENSE ? '-' : '+'}
                  ₹{transaction.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {transaction.paymentMethod.toLowerCase()}
                </p>
              </div>
              
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                transaction.type === TransactionType.EXPENSE 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-success/10 text-success"
              )}>
                {transaction.type === TransactionType.EXPENSE ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownLeft className="h-3 w-3" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}