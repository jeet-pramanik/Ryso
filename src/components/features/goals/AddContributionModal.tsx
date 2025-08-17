import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target } from 'lucide-react';
import { SavingsGoal } from '@/types';
import { useGoalsStore } from '@/stores/goalsStore';
import { cn } from '@/lib/utils';

interface AddContributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
}

const AddContributionModal: React.FC<AddContributionModalProps> = ({ 
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Add to Goal</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Overview */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: goal.color }}
              >
                <Target className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress value={currentProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentProgress.toFixed(1)}% complete</span>
                <span>{formatCurrency(remainingAmount)} remaining</span>
              </div>
            </div>
          </div>

          {/* Contribution Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Contribution Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className={cn("pl-8 text-lg", error ? 'border-red-500' : '')}
                min="1"
                step="0.01"
                max={remainingAmount}
              />
            </div>
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Weekly savings, bonus money"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Preview */}
          {contributionAmount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <h4 className="font-medium text-green-900">After this contribution:</h4>
              <div className="space-y-1 text-sm text-green-800">
                <div className="flex justify-between">
                  <span>New total:</span>
                  <span className="font-semibold">{formatCurrency(newAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className="font-semibold">{newProgress.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-semibold">{formatCurrency(goal.targetAmount - newAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick amounts:</Label>
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 2000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={quickAmount > remainingAmount}
                  className="text-xs"
                >
                  ₹{quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Add Contribution'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContributionModal;
