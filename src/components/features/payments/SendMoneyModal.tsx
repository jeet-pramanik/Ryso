import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransactionStore } from '@/stores/transactionStore';
import { useUserStore } from '@/stores/userStore';
import { ExpenseCategory, TransactionType, PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentStep = 'form' | 'confirm' | 'processing' | 'success' | 'error';

export default function SendMoneyModal({ isOpen, onClose }: SendMoneyModalProps) {
  const { user } = useUserStore();
  const { addTransaction } = useTransactionStore();
  
  const [step, setStep] = useState<PaymentStep>('form');
  const [formData, setFormData] = useState({
    recipientUPI: '',
    amount: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.recipientUPI.trim()) {
      newErrors.recipientUPI = 'Please enter UPI ID';
    } else if (!formData.recipientUPI.includes('@')) {
      newErrors.recipientUPI = 'Please enter a valid UPI ID';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(formData.amount) > 10000) {
      newErrors.amount = 'Amount cannot exceed ₹10,000';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setStep('confirm');
  };

  const handleConfirmPayment = () => {
    setStep('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      // 95% success rate for demo
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess && user) {
        // Add transaction
        const transaction = {
          userId: user.id,
          amount: parseFloat(formData.amount),
          description: `Sent to ${formData.recipientUPI} - ${formData.description}`,
          category: ExpenseCategory.TRANSPORT, // Using as placeholder
          date: new Date().toISOString(),
          type: TransactionType.EXPENSE,
          paymentMethod: PaymentMethod.UPI,
          merchantName: formData.recipientUPI,
          upiTransactionId: `UPI${Date.now()}${Math.random().toString(36).substr(2, 6)}`
        };

        addTransaction(transaction);
        setStep('success');
      } else {
        setStep('error');
      }
    }, 2000);
  };

  const resetModal = () => {
    setStep('form');
    setFormData({
      recipientUPI: '',
      amount: '',
      description: ''
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

  const renderStep = () => {
    switch (step) {
      case 'form':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="recipientUPI">Recipient UPI ID</Label>
              <Input
                id="recipientUPI"
                placeholder="friend@paytm"
                value={formData.recipientUPI}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientUPI: e.target.value }))}
                className={cn("input-field", errors.recipientUPI && "border-destructive")}
              />
              {errors.recipientUPI && (
                <p className="text-sm text-destructive mt-1">{errors.recipientUPI}</p>
              )}
            </div>

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

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What is this payment for?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={cn("input-field", errors.description && "border-destructive")}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 btn-primary">
                Continue
              </Button>
            </div>
          </form>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Confirm Payment</h3>
              <p className="text-muted-foreground">Please review the payment details</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">{formData.recipientUPI}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-lg">₹{parseFloat(formData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Description:</span>
                <span className="font-medium">{formData.description}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setStep('form')} 
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirmPayment} 
                className="flex-1 btn-success"
              >
                Pay Now
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
            <p className="text-muted-foreground">Please wait while we process your payment...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-4">
              ₹{parseFloat(formData.amount).toLocaleString()} sent to {formData.recipientUPI}
            </p>
            <Button onClick={resetModal} className="btn-primary">
              Done
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
            <p className="text-muted-foreground mb-4">
              Something went wrong. Please try again.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={resetModal} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStep('form')} className="flex-1 btn-primary">
                Try Again
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
          >
            {step !== 'processing' && step !== 'success' && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <Send className="h-5 w-5 text-success" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Send Money</h2>
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
            )}

            {renderStep()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}