import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, X } from 'lucide-react';
import { SavingsGoal } from '@/types';
import { useGoalsStore } from '@/stores/goalsStore';
import { cn } from '@/lib/utils';

interface AddContributionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
}

const AddContributionSheet: React.FC<AddContributionSheetProps> = ({ 
  open, 
  onOpenChange, 
  goal 
}) => {
  const { addContribution, isLoading } = useGoalsStore();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goal || !amount) return;

    const contributionAmount = parseFloat(amount);
    
    if (contributionAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (goal.currentAmount + contributionAmount > goal.targetAmount) {
      setError('Contribution would exceed the goal target');
      return;
    }

    try {
      await addContribution(goal.id, contributionAmount, description.trim() || undefined);
      
      // Reset form and close modal
      setAmount('');
      setDescription('');
      setError('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding contribution:', error);
      setError('Failed to add contribution. Please try again.');
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    setError('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  if (!goal) return null;

  const currentProgress = (goal.currentAmount / goal.targetAmount) * 100;
  const contributionAmount = parseFloat(amount) || 0;
  const newAmount = goal.currentAmount + contributionAmount;
  const newProgress = Math.min((newAmount / goal.targetAmount) * 100, 100);
  const remainingAmount = goal.targetAmount - goal.currentAmount;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Add Contribution</SheetTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
               
              </Button>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 pb-4 space-y-6">
              {/* Goal Overview */}
              <div className="bg-blue-50 rounded-2xl p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-gray"
                    style={{ backgroundColor: goal.color }}
                  >
                    <Target className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{goal.title}</h3>
                    <p className="text-sm text-blue-600">
                      {goal.description || 'Building a safety net for unexpected expenses'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Progress</span>
                    <span className="text-lg font-bold text-gray-900">{currentProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={currentProgress} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-900">{formatCurrency(goal.currentAmount)}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(remainingAmount)} remaining to reach your goal
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Quick amounts:</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[100, 500, 1000, 2000].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => handleQuickAmount(quickAmount)}
                      disabled={quickAmount > remainingAmount}
                      className={cn(
                        "h-16 text-lg font-semibold border-2",
                        amount === quickAmount.toString() 
                          ? "border-blue-500 bg-blue-50 text-blue-700" 
                          : "border-gray-200 hover:border-blue-300"
                      )}
                    >
                      ₹{quickAmount.toLocaleString('en-IN')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Custom Amount</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">₹</span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError('');
                    }}
                    className={cn(
                      "pl-10 h-14 text-xl font-medium border-2",
                      error ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                    )}
                    min="1"
                    step="0.01"
                    max={remainingAmount}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>

              {/* Note */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Note (Optional)</Label>
                <Textarea
                  placeholder="e.g., Weekly savings, bonus money, birthday gift"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px] text-base border-2 border-gray-200 focus:border-blue-500"
                  rows={3}
                />
              </div>

              {/* Preview */}
              {contributionAmount > 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-semibold text-green-900 text-lg">After this contribution:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">New total:</span>
                      <span className="font-bold text-green-900 text-lg">{formatCurrency(newAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Progress:</span>
                      <span className="font-bold text-green-900 text-lg">{newProgress.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Remaining:</span>
                      <span className="font-bold text-green-900 text-lg">{formatCurrency(goal.targetAmount - newAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action */}
          <div className="p-6 pb-24 border-t border-gray-100 bg-white">
            <Button
              onClick={handleSubmit}
              className="w-full h-14 text-lg font-semibold bg-blue-500 hover:bg-blue-600"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Add Contribution'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddContributionSheet;
