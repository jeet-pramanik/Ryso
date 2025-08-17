import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CategoryOverview } from './CategoryOverview';
import { CategoryDetail } from './CategoryDetail';
import { TransactionList } from './TransactionList';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useUserStore } from '@/stores/userStore';
import { transactionRepository } from '@/services/repositories/TransactionRepository';
import { categorizationService } from '@/services/categorization';
import { ExpenseCategory, TransactionType, PaymentMethod } from '@/types';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { Plus, RefreshCw, BarChart3, List, Settings, AlertCircle } from 'lucide-react';

type ViewMode = 'overview' | 'category-detail' | 'list';

interface NewTransactionForm {
  amount: string;
  description: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  merchantName: string;
}

export function EnhancedExpensesPage() {
  const { toast } = useToast();
  const { transactions, hydrate: hydrateTransactions } = useTransactionStore();
  const { currentBudget } = useBudgetStore();
  const { user: currentUser } = useUserStore();
  
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isRecategorizing, setIsRecategorizing] = useState(false);
  const [categorizationStats, setCategorizationStats] = useState<any>(null);
  
  const [newTransaction, setNewTransaction] = useState<NewTransactionForm>({
    amount: '',
    description: '',
    category: ExpenseCategory.FOOD,
    paymentMethod: PaymentMethod.UPI,
    merchantName: ''
  });

  useEffect(() => {
    loadCategorizationStats();
  }, [transactions]);

  const loadCategorizationStats = async () => {
    if (!currentUser) return;
    
    try {
      const stats = await transactionRepository.getCategorizationStats(currentUser.id);
      setCategorizationStats(stats);
    } catch (error) {
      console.error('Failed to load categorization stats:', error);
    }
  };

  const handleAddTransaction = async () => {
    if (!currentUser || !newTransaction.amount || !newTransaction.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in amount and description",
        variant: "destructive"
      });
      return;
    }

    try {
      const transactionData = {
        amount: parseFloat(newTransaction.amount),
        description: newTransaction.description,
        type: TransactionType.EXPENSE,
        paymentMethod: newTransaction.paymentMethod,
        merchantName: newTransaction.merchantName || undefined,
        userId: currentUser.id,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Use auto-categorization if no specific category was selected
      if (newTransaction.category === ExpenseCategory.FOOD && newTransaction.description) {
        await transactionRepository.createWithCategorization(transactionData);
      } else {
        // Manual categorization
        const transaction = {
          ...transactionData,
          id: crypto.randomUUID(),
          category: newTransaction.category,
          categoryConfidence: 1.0,
          isManualCategory: true,
          categorizationReason: 'Manual categorization'
        };
        await transactionRepository.create(transaction);
      }

      await hydrateTransactions();
      await loadCategorizationStats();

      setNewTransaction({
        amount: '',
        description: '',
        category: ExpenseCategory.FOOD,
        paymentMethod: PaymentMethod.UPI,
        merchantName: ''
      });
      setIsAddingTransaction(false);

      toast({
        title: "Transaction Added",
        description: "Your expense has been recorded successfully"
      });
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive"
      });
    }
  };

  const handleCategoryChange = async (transactionId: string, category: ExpenseCategory) => {
    try {
      await transactionRepository.updateCategoryManually(
        transactionId, 
        category, 
        'Updated via category detail'
      );
      await hydrateTransactions();
      await loadCategorizationStats();

      toast({
        title: "Category Updated",
        description: "Transaction category has been updated"
      });
    } catch (error) {
      console.error('Failed to update category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };

  const handleRecategorize = async () => {
    if (!currentUser) return;

    setIsRecategorizing(true);
    try {
      const result = await transactionRepository.recategorizeUserTransactions(currentUser.id);
      await hydrateTransactions();
      await loadCategorizationStats();

      toast({
        title: "Re-categorization Complete",
        description: `Processed ${result.processed} transactions, updated ${result.updated}`
      });
    } catch (error) {
      console.error('Failed to recategorize:', error);
      toast({
        title: "Error",
        description: "Failed to re-categorize transactions",
        variant: "destructive"
      });
    } finally {
      setIsRecategorizing(false);
    }
  };

  const handleCategoryClick = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setViewMode('category-detail');
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedCategory(null);
  };

  const currentMonthTransactions = transactions.filter(tx => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return tx.date.startsWith(currentMonth);
  });

  const budgetAllocation = currentBudget?.categories || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Smart Expenses</h1>
          <p className="text-muted-foreground">
            AI-powered expense categorization and insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggles */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('overview')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Add Transaction */}
          <Dialog open={isAddingTransaction} onOpenChange={setIsAddingTransaction}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Amount (₹)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      amount: e.target.value 
                    }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="What did you spend on?"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newTransaction.category}
                    onValueChange={(value) => setNewTransaction(prev => ({ 
                      ...prev, 
                      category: value as ExpenseCategory 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.icon} {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave as "Food" for auto-categorization based on description
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select
                    value={newTransaction.paymentMethod}
                    onValueChange={(value) => setNewTransaction(prev => ({ 
                      ...prev, 
                      paymentMethod: value as PaymentMethod 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                      <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                      <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Merchant Name (Optional)</label>
                  <Input
                    placeholder="e.g., Zomato, Uber, etc."
                    value={newTransaction.merchantName}
                    onChange={(e) => setNewTransaction(prev => ({ 
                      ...prev, 
                      merchantName: e.target.value 
                    }))}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddingTransaction(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddTransaction} className="flex-1">
                    Add Expense
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categorization Stats */}
      {categorizationStats && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Categorization Quality</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default">
                      {categorizationStats.manual} Manual
                    </Badge>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {categorizationStats.automatic - categorizationStats.lowConfidence} High Confidence
                    </Badge>
                    {categorizationStats.lowConfidence > 0 && (
                      <Badge variant="destructive">
                        {categorizationStats.lowConfidence} Low Confidence
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Avg: {Math.round(categorizationStats.averageConfidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleRecategorize}
                disabled={isRecategorizing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRecategorizing ? 'animate-spin' : ''}`} />
                {isRecategorizing ? 'Re-categorizing...' : 'Re-categorize All'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {viewMode === 'overview' && (
        <CategoryOverview
          transactions={currentMonthTransactions}
          budgetAllocation={budgetAllocation}
          onCategoryClick={handleCategoryClick}
          onRecategorize={handleRecategorize}
        />
      )}

      {viewMode === 'category-detail' && selectedCategory && (
        <CategoryDetail
          category={selectedCategory}
          transactions={transactions}
          budgetAmount={budgetAllocation[selectedCategory]?.allocated}
          onBack={handleBackToOverview}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {viewMode === 'list' && (
        <TransactionList
          transactions={currentMonthTransactions}
          title="All Expenses"
          onCategoryChange={handleCategoryChange}
          highlightLowConfidence={true}
          showFilters={true}
        />
      )}
    </div>
  );
}
