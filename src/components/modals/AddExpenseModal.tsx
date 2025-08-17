import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransactionStore } from '@/stores/transactionStore';
import { useUserStore } from '@/stores/userStore';
import { ExpenseCategory, TransactionType, PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';

const categoryOptions = [
  { value: ExpenseCategory.FOOD, label: 'Food', icon: '🍕', color: 'category-food' },
  { value: ExpenseCategory.TRANSPORT, label: 'Transport', icon: '🚕', color: 'category-transport' },
  { value: ExpenseCategory.HOSTEL, label: 'Hostel', icon: '🏠', color: 'category-hostel' },
  { value: ExpenseCategory.BOOKS, label: 'Books', icon: '📚', color: 'category-books' },
  { value: ExpenseCategory.ENTERTAINMENT, label: 'Entertainment', icon: '🎬', color: 'category-entertainment' },
  { value: ExpenseCategory.EMERGENCY, label: 'Emergency', icon: '🚨', color: 'category-emergency' }
];

const paymentMethods = [
  { value: PaymentMethod.UPI, label: 'UPI' },
  { value: PaymentMethod.CASH, label: 'Cash' },
  { value: PaymentMethod.CARD, label: 'Card' }
];

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { user } = useUserStore();
  const { addTransaction } = useTransactionStore();
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: ExpenseCategory.FOOD,
    paymentMethod: PaymentMethod.UPI,
    merchantName: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    const transaction = {
      userId: user.id,
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      category: formData.category,
      date: new Date().toISOString(),
      type: TransactionType.EXPENSE,
      paymentMethod: formData.paymentMethod,
      merchantName: formData.merchantName.trim() || undefined,
      upiTransactionId: formData.paymentMethod === PaymentMethod.UPI 
        ? `UPI${Date.now()}${Math.random().toString(36).substr(2, 6)}`
        : undefined
    };

    addTransaction(transaction);
    
    // Reset form
    setFormData({
      amount: '',
      description: '',
      category: ExpenseCategory.FOOD,
      paymentMethod: PaymentMethod.UPI,
      merchantName: ''
    });
    setErrors({});
    
    onClose();
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-card rounded-2xl p-6 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Add Expense</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className={cn("input-field", errors.amount && "border-destructive")}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What did you spend on?"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={cn("input-field", errors.description && "border-destructive")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <Label>Category</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {categoryOptions.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200",
                        formData.category === category.value
                          ? category.color + " border-current"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-xs font-medium">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label>Payment Method</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all duration-200",
                        formData.paymentMethod === method.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Merchant Name (Optional) */}
              <div>
                <Label htmlFor="merchant">Merchant (Optional)</Label>
                <Input
                  id="merchant"
                  placeholder="e.g., Zomato, McDonald's"
                  value={formData.merchantName}
                  onChange={(e) => setFormData(prev => ({ ...prev, merchantName: e.target.value }))}
                  className="input-field"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Add Expense
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}