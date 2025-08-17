import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExpenseCategory, Transaction } from '@/types';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { transactionRepository } from '@/services/repositories/TransactionRepository';
import { TrendingUp, TrendingDown, AlertTriangle, Settings } from 'lucide-react';

interface CategoryOverviewProps {
  transactions: Transaction[];
  budgetAllocation?: Partial<Record<ExpenseCategory, number>>;
  onCategoryClick?: (category: ExpenseCategory) => void;
  onRecategorize?: () => void;
  showRecategorizeButton?: boolean;
}

interface CategorySummary {
  category: ExpenseCategory;
  spent: number;
  budget: number;
  percentage: number;
  transactionCount: number;
  avgAmount: number;
  trend: 'up' | 'down' | 'neutral';
  confidence: number;
  manualCount: number;
}

export function CategoryOverview({ 
  transactions, 
  budgetAllocation = {},
  onCategoryClick,
  onRecategorize,
  showRecategorizeButton = true
}: CategoryOverviewProps) {
  const categorySummaries = useMemo(() => {
    const summaries: CategorySummary[] = [];
    
    Object.values(ExpenseCategory).forEach(category => {
      const categoryTransactions = transactions.filter(tx => 
        tx.category === category && tx.type === 'EXPENSE'
      );
      
      const spent = categoryTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const budget = budgetAllocation[category] || 0;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      const avgAmount = categoryTransactions.length > 0 
        ? spent / categoryTransactions.length 
        : 0;
      
      // Calculate confidence stats
      const confidenceSum = categoryTransactions.reduce((sum, tx) => 
        sum + (tx.categoryConfidence || 0), 0
      );
      const avgConfidence = categoryTransactions.length > 0 
        ? confidenceSum / categoryTransactions.length 
        : 0;
      
      const manualCount = categoryTransactions.filter(tx => tx.isManualCategory).length;
      
      // Simple trend calculation (could be enhanced with historical data)
      const trend: 'up' | 'down' | 'neutral' = percentage > 80 ? 'up' : 
                                                percentage < 40 ? 'down' : 'neutral';
      
      summaries.push({
        category,
        spent,
        budget,
        percentage,
        transactionCount: categoryTransactions.length,
        avgAmount,
        trend,
        confidence: avgConfidence,
        manualCount
      });
    });
    
    return summaries.sort((a, b) => b.spent - a.spent);
  }, [transactions, budgetAllocation]);

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getConfidenceBadge = (confidence: number, manualCount: number, totalCount: number) => {
    if (manualCount === totalCount && totalCount > 0) {
      return <Badge variant="default" className="text-xs">Manual</Badge>;
    }
    
    if (confidence >= 0.8) {
      return <Badge variant="default" className="text-xs bg-green-100 text-green-800">High</Badge>;
    } else if (confidence >= 0.6) {
      return <Badge variant="secondary" className="text-xs">Medium</Badge>;
    } else if (confidence > 0) {
      return <Badge variant="destructive" className="text-xs">Low</Badge>;
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Category Overview</h3>
        {showRecategorizeButton && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRecategorize}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Re-categorize
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorySummaries.map((summary) => {
          const config = CATEGORY_CONFIG[summary.category];
          
          return (
            <Card 
              key={summary.category}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                onCategoryClick ? 'hover:border-primary' : ''
              }`}
              onClick={() => onCategoryClick?.(summary.category)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.icon}</span>
                    <span>{config.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(summary.trend)}
                    {getConfidenceBadge(summary.confidence, summary.manualCount, summary.transactionCount)}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Amount and Budget */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-2xl font-bold">₹{summary.spent}</span>
                      {summary.budget > 0 && (
                        <span className="text-sm text-muted-foreground">
                          / ₹{summary.budget}
                        </span>
                      )}
                    </div>
                    
                    {summary.budget > 0 && (
                      <div className="space-y-1">
                        <Progress 
                          value={Math.min(summary.percentage, 100)} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round(summary.percentage)}%</span>
                          {summary.percentage > 100 && (
                            <span className="text-red-500 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Over budget
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Transaction Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Transactions</div>
                      <div className="font-medium">{summary.transactionCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Avg Amount</div>
                      <div className="font-medium">
                        ₹{summary.avgAmount > 0 ? Math.round(summary.avgAmount) : 0}
                      </div>
                    </div>
                  </div>
                  
                  {/* Categorization Info */}
                  {summary.transactionCount > 0 && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      {summary.manualCount > 0 && (
                        <div>{summary.manualCount} manual categorizations</div>
                      )}
                      {summary.confidence > 0 && summary.manualCount < summary.transactionCount && (
                        <div>
                          Auto-categorization confidence: {Math.round(summary.confidence * 100)}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
