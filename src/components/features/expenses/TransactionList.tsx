import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, ExpenseCategory, TransactionType, PaymentMethod } from '@/types';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { Search, Calendar, Filter, Edit3, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
  showFilters?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
  onCategoryChange?: (transactionId: string, category: ExpenseCategory) => void;
  highlightLowConfidence?: boolean;
}

interface FilterState {
  search: string;
  category: ExpenseCategory | 'all';
  type: TransactionType | 'all';
  paymentMethod: PaymentMethod | 'all';
  dateRange: 'all' | 'week' | 'month';
  confidenceFilter: 'all' | 'low' | 'high' | 'manual';
}

export function TransactionList({
  transactions,
  title = 'Transactions',
  showFilters = true,
  onTransactionClick,
  onCategoryChange,
  highlightLowConfidence = false
}: TransactionListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    type: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    confidenceFilter: 'all'
  });

  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);

  const filteredTransactions = React.useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(searchLower) ||
        tx.merchantName?.toLowerCase().includes(searchLower) ||
        tx.upiTransactionId?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(tx => tx.category === filters.category);
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(tx => tx.type === filters.type);
    }

    // Payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(tx => tx.paymentMethod === filters.paymentMethod);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(tx => new Date(tx.date) >= cutoffDate);
    }

    // Confidence filter
    if (filters.confidenceFilter !== 'all') {
      switch (filters.confidenceFilter) {
        case 'low':
          filtered = filtered.filter(tx => 
            !tx.isManualCategory && (tx.categoryConfidence || 0) < 0.6
          );
          break;
        case 'high':
          filtered = filtered.filter(tx => 
            !tx.isManualCategory && (tx.categoryConfidence || 0) >= 0.8
          );
          break;
        case 'manual':
          filtered = filtered.filter(tx => tx.isManualCategory);
          break;
      }
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filters]);

  const handleCategoryChange = (transactionId: string, newCategory: ExpenseCategory) => {
    onCategoryChange?.(transactionId, newCategory);
    setEditingTransaction(null);
  };

  const getConfidenceBadge = (transaction: Transaction) => {
    if (transaction.isManualCategory) {
      return <Badge variant="default" className="text-xs">Manual</Badge>;
    }
    
    const confidence = transaction.categoryConfidence || 0;
    if (confidence >= 0.8) {
      return <Badge variant="default" className="text-xs bg-green-100 text-green-800">High</Badge>;
    } else if (confidence >= 0.6) {
      return <Badge variant="secondary" className="text-xs">Medium</Badge>;
    } else {
      return <Badge variant="destructive" className="text-xs">Low</Badge>;
    }
  };

  const getAmountColor = (transaction: Transaction) => {
    switch (transaction.type) {
      case TransactionType.INCOME:
        return 'text-green-600';
      case TransactionType.SAVINGS:
        return 'text-blue-600';
      default:
        return 'text-red-600';
    }
  };

  const getAmountPrefix = (transaction: Transaction) => {
    switch (transaction.type) {
      case TransactionType.INCOME:
        return '+';
      case TransactionType.SAVINGS:
        return '';
      default:
        return '-';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {filteredTransactions.length} transactions
          </span>
        </CardTitle>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-8"
              />
            </div>
            
            {/* Category Filter */}
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                category: value as ExpenseCategory | 'all' 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Type Filter */}
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                type: value as TransactionType | 'all' 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={TransactionType.EXPENSE}>Expense</SelectItem>
                <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
                <SelectItem value={TransactionType.SAVINGS}>Savings</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Payment Method Filter */}
            <Select
              value={filters.paymentMethod}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                paymentMethod: value as PaymentMethod | 'all' 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Date Range Filter */}
            <Select
              value={filters.dateRange}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                dateRange: value as typeof filters.dateRange 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Confidence Filter */}
            <Select
              value={filters.confidenceFilter}
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                confidenceFilter: value as typeof filters.confidenceFilter 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                <SelectItem value="high">High Confidence</SelectItem>
                <SelectItem value="low">Low Confidence</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const config = CATEGORY_CONFIG[transaction.category];
              const isLowConfidence = highlightLowConfidence && 
                !transaction.isManualCategory && 
                (transaction.categoryConfidence || 0) < 0.6;
              
              return (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
                    isLowConfidence ? 'border-yellow-200 bg-yellow-50' : ''
                  }`}
                  onClick={() => onTransactionClick?.(transaction)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-xl">{config.icon}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {transaction.description}
                        </span>
                        {isLowConfidence && (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{transaction.paymentMethod}</span>
                        {transaction.merchantName && (
                          <>
                            <span>•</span>
                            <span className="truncate">{transaction.merchantName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Category Badge with Edit Option */}
                    <div className="flex items-center gap-1">
                      {editingTransaction === transaction.id ? (
                        <Select
                          value={transaction.category}
                          onValueChange={(value) => 
                            handleCategoryChange(transaction.id, value as ExpenseCategory)
                          }
                        >
                          <SelectTrigger className="w-32">
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
                      ) : (
                        <>
                          <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onCategoryChange) {
                                setEditingTransaction(transaction.id);
                              }
                            }}
                          >
                            {config.name}
                            {onCategoryChange && (
                              <Edit3 className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                          {getConfidenceBadge(transaction)}
                        </>
                      )}
                    </div>
                    
                    {/* Amount */}
                    <div className={`font-semibold ${getAmountColor(transaction)}`}>
                      {getAmountPrefix(transaction)}₹{transaction.amount}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
