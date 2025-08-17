import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExpenseCategory, Transaction } from '@/types';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { TransactionList } from './TransactionList';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface CategoryDetailProps {
  category: ExpenseCategory;
  transactions: Transaction[];
  budgetAmount?: number;
  onBack?: () => void;
  onCategoryChange?: (transactionId: string, category: ExpenseCategory) => void;
}

interface DaySpending {
  date: string;
  amount: number;
  count: number;
}

export function CategoryDetail({
  category,
  transactions,
  budgetAmount = 0,
  onBack,
  onCategoryChange
}: CategoryDetailProps) {
  const config = CATEGORY_CONFIG[category];
  
  const categoryTransactions = useMemo(() => 
    transactions.filter(tx => tx.category === category && tx.type === 'EXPENSE'),
    [transactions, category]
  );

  const stats = useMemo(() => {
    const totalSpent = categoryTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const avgTransaction = categoryTransactions.length > 0 
      ? totalSpent / categoryTransactions.length 
      : 0;
    
    const thisMonth = format(new Date(), 'yyyy-MM');
    const thisMonthTransactions = categoryTransactions.filter(tx => 
      tx.date.startsWith(thisMonth)
    );
    const thisMonthSpent = thisMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    const lastMonth = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM');
    const lastMonthTransactions = categoryTransactions.filter(tx => 
      tx.date.startsWith(lastMonth)
    );
    const lastMonthSpent = lastMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    const trend = lastMonthSpent > 0 
      ? ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100
      : 0;
    
    const budgetPercentage = budgetAmount > 0 ? (thisMonthSpent / budgetAmount) * 100 : 0;
    
    // Categorization stats
    const manualCount = categoryTransactions.filter(tx => tx.isManualCategory).length;
    const lowConfidenceCount = categoryTransactions.filter(tx => 
      !tx.isManualCategory && (tx.categoryConfidence || 0) < 0.6
    ).length;
    
    return {
      totalSpent,
      avgTransaction,
      thisMonthSpent,
      lastMonthSpent,
      trend,
      budgetPercentage,
      transactionCount: categoryTransactions.length,
      manualCount,
      lowConfidenceCount
    };
  }, [categoryTransactions, budgetAmount]);

  const dailySpending = useMemo(() => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const spendingByDay = new Map<string, DaySpending>();
    
    // Initialize all days with zero
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      spendingByDay.set(dateStr, {
        date: dateStr,
        amount: 0,
        count: 0
      });
    });
    
    // Aggregate transactions by day
    categoryTransactions.forEach(tx => {
      const dateStr = tx.date.split('T')[0]; // Get date part only
      const existing = spendingByDay.get(dateStr);
      if (existing) {
        existing.amount += tx.amount;
        existing.count += 1;
      }
    });
    
    return Array.from(spendingByDay.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [categoryTransactions]);

  const maxDailySpend = Math.max(...dailySpending.map(d => d.amount), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{config.name}</h1>
            <p className="text-muted-foreground">
              {stats.transactionCount} transactions • ₹{Math.round(stats.avgTransaction)} avg
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* This Month Spending */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">₹{stats.thisMonthSpent}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            {budgetAmount > 0 && (
              <div className="mt-3">
                <Progress value={Math.min(stats.budgetPercentage, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(stats.budgetPercentage)}% of ₹{budgetAmount} budget
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Trend</p>
                <p className={`text-2xl font-bold flex items-center gap-1 ${
                  stats.trend > 0 ? 'text-red-500' : stats.trend < 0 ? 'text-green-500' : ''
                }`}>
                  {stats.trend > 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : stats.trend < 0 ? (
                    <TrendingDown className="h-5 w-5" />
                  ) : null}
                  {Math.abs(stats.trend).toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs last month (₹{stats.lastMonthSpent})
            </p>
          </CardContent>
        </Card>

        {/* Transaction Count */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{stats.transactionCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg ₹{Math.round(stats.avgTransaction)} per transaction
            </p>
          </CardContent>
        </Card>

        {/* Categorization Quality */}
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Categorization</p>
              <div className="flex items-center gap-2 mt-1">
                {stats.manualCount > 0 && (
                  <Badge variant="default" className="text-xs">
                    {stats.manualCount} Manual
                  </Badge>
                )}
                {stats.lowConfidenceCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {stats.lowConfidenceCount} Low Confidence
                  </Badge>
                )}
                {stats.manualCount === 0 && stats.lowConfidenceCount === 0 && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    All High Confidence
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Spending Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Spending This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dailySpending.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <div className="w-16 text-xs text-muted-foreground">
                  {format(new Date(day.date), 'MMM d')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={day.amount > 0 ? (day.amount / maxDailySpend) * 100 : 0} 
                      className="h-3 flex-1"
                    />
                    <div className="w-16 text-right text-sm">
                      {day.amount > 0 ? `₹${day.amount}` : ''}
                    </div>
                    <div className="w-8 text-right text-xs text-muted-foreground">
                      {day.count > 0 ? day.count : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <TransactionList
        transactions={categoryTransactions}
        title={`${config.name} Transactions`}
        onCategoryChange={onCategoryChange}
        highlightLowConfidence={true}
        showFilters={true}
      />
    </div>
  );
}
