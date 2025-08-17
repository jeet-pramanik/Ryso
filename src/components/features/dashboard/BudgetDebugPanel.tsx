import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RefreshCw, Trash2, Plus, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBudgetStore } from '@/stores/budgetStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { ExpenseCategory, TransactionType, PaymentMethod } from '@/types';
import { APP_CONFIG } from '@/constants/app';

interface BudgetDebugPanelProps {
  className?: string;
}

export default function BudgetDebugPanel({ className }: BudgetDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mockTransaction, setMockTransaction] = useState({
    amount: 100,
    category: ExpenseCategory.FOOD,
    description: 'Test expense'
  });

  const { currentBudget, hydrate: hydrateBudget, getBudgetStats } = useBudgetStore();
  const { addTransaction, clearAllTransactions, hydrate: hydrateTransactions } = useTransactionStore();

  const stats = currentBudget ? getBudgetStats() : null;

  const handleAddMockTransaction = async () => {
    const transaction = {
      id: `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: APP_CONFIG.DEMO_USER_ID,
      amount: mockTransaction.amount,
      description: mockTransaction.description,
      category: mockTransaction.category,
      date: new Date().toISOString(),
      type: TransactionType.EXPENSE,
      paymentMethod: PaymentMethod.CASH,
      merchantName: 'Debug Transaction',
      createdAt: new Date().toISOString()
    };

    await addTransaction(transaction);
    await hydrateBudget(); // Refresh budget calculations
  };

  const handleClearTransactions = async () => {
    await clearAllTransactions();
    await hydrateBudget(); // Refresh budget calculations
  };

  const generateScenario = async (scenarioType: 'under' | 'warning' | 'over') => {
    if (!currentBudget) return;
    
    setIsGenerating(true);
    
    try {
      await clearAllTransactions();
      
      const targetSpending = (() => {
        switch (scenarioType) {
          case 'under': return currentBudget.monthlyAmount * 0.4; // 40% of budget
          case 'warning': return currentBudget.monthlyAmount * 0.8; // 80% of budget  
          case 'over': return currentBudget.monthlyAmount * 1.2; // 120% of budget
          default: return currentBudget.monthlyAmount * 0.5;
        }
      })();

      const categories = Object.values(ExpenseCategory);
      const transactionsToAdd = Math.floor(targetSpending / 100); // ~₹100 per transaction
      
      for (let i = 0; i < transactionsToAdd; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const amount = Math.floor(Math.random() * 150) + 50; // ₹50-200
        
        const transaction = {
          id: `scenario_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          userId: APP_CONFIG.DEMO_USER_ID,
          amount,
          description: `${scenarioType} budget scenario`,
          category,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          type: TransactionType.EXPENSE,
          paymentMethod: PaymentMethod.UPI,
          merchantName: 'Debug Scenario',
          createdAt: new Date().toISOString()
        };

        await addTransaction(transaction);
      }

      await hydrateBudget();
      await hydrateTransactions();
    } catch (error) {
      console.error('Failed to generate scenario:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Always show debug panel, even without budget
  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4"
          >
            <Card className="w-80 shadow-2xl border-2 bg-background">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Budget Debug Panel
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">DEV</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!currentBudget ? (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-2 text-warning">No Budget Set</p>
                    <p className="text-xs text-muted-foreground">
                      Create a budget first to use debug features
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Current Stats */}
                    {stats && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-2">Current Budget Status</p>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Spent:</span>
                            <span>₹{stats.totalSpent.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Budget:</span>
                            <span>₹{stats.totalAllocated.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Usage:</span>
                            <span className={
                              stats.percentage > 100 ? 'text-destructive' :
                              stats.percentage > 80 ? 'text-warning' : 'text-success'
                            }>
                              {stats.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Scenarios */}
                    <div>
                      <Label className="text-sm font-medium">Test Scenarios</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateScenario('under')}
                          disabled={isGenerating}
                          className="text-xs"
                        >
                          Under Budget
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateScenario('warning')}
                          disabled={isGenerating}
                          className="text-xs"
                        >
                          Warning
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateScenario('over')}
                          disabled={isGenerating}
                          className="text-xs"
                        >
                          Over Budget
                        </Button>
                      </div>
                    </div>

                    {/* Add Custom Transaction */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Add Test Transaction</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={mockTransaction.amount}
                            onChange={(e) => setMockTransaction(prev => ({
                              ...prev,
                              amount: parseInt(e.target.value) || 0
                            }))}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Select 
                            value={mockTransaction.category}
                            onValueChange={(value) => setMockTransaction(prev => ({
                              ...prev,
                              category: value as ExpenseCategory
                            }))}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(ExpenseCategory).map(category => (
                                <SelectItem key={category} value={category} className="text-xs">
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleAddMockTransaction}
                        className="w-full text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Transaction
                      </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={async () => {
                          await hydrateBudget();
                          await hydrateTransactions();
                        }}
                        className="flex-1 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleClearTransactions}
                        className="flex-1 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Clear All
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full shadow-2xl bg-primary text-primary-foreground border-2 hover:bg-primary/90"
        title="Open Debug Panel"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}
