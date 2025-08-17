import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, TransactionType, PaymentMethod } from '@/types';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { Search, Filter, Download, CheckCircle, XCircle, Clock, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionHistoryProps {
  transactions: Transaction[];
  title?: string;
  showFilters?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
}

interface FilterState {
  search: string;
  status: 'all' | 'success' | 'failed' | 'pending';
  paymentMethod: PaymentMethod | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

// Mock payment status for demonstration
const getPaymentStatus = (transaction: Transaction): 'success' | 'failed' | 'pending' => {
  // Most UPI payments are successful
  if (transaction.paymentMethod === PaymentMethod.UPI) {
    return Math.random() > 0.05 ? 'success' : 'failed';
  }
  return 'success';
};

export function TransactionHistory({
  transactions,
  title = 'Payment History',
  showFilters = true,
  onTransactionClick
}: TransactionHistoryProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [showExportOptions, setShowExportOptions] = useState(false);

  const filteredTransactions = useMemo(() => {
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

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(tx => {
        const status = getPaymentStatus(tx);
        return status === filters.status;
      });
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
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(tx => new Date(tx.date) >= cutoffDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'date':
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [transactions, filters]);

  const stats = useMemo(() => {
    const total = filteredTransactions.length;
    const successful = filteredTransactions.filter(tx => getPaymentStatus(tx) === 'success').length;
    const failed = filteredTransactions.filter(tx => getPaymentStatus(tx) === 'failed').length;
    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    return { total, successful, failed, totalAmount, successRate: total > 0 ? (successful / total) * 100 : 0 };
  }, [filteredTransactions]);

  const getStatusIcon = (transaction: Transaction) => {
    const status = getPaymentStatus(transaction);
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (transaction: Transaction) => {
    const status = getPaymentStatus(transaction);
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
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

  const exportTransactions = (exportFormat: 'csv' | 'json') => {
    const dataStr = exportFormat === 'json' 
      ? JSON.stringify(filteredTransactions, null, 2)
      : generateCSV(filteredTransactions);
    
    const dataUri = 'data:text/' + exportFormat + ';charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `transactions_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const generateCSV = (data: Transaction[]): string => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Payment Method', 'Merchant', 'Status'];
    const rows = data.map(tx => [
      format(new Date(tx.date), 'yyyy-MM-dd HH:mm'),
      tx.description,
      tx.amount,
      CATEGORY_CONFIG[tx.category].name,
      tx.paymentMethod,
      tx.merchantName || '',
      getPaymentStatus(tx)
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {showExportOptions && (
                <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-lg p-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportTransactions('csv')}
                    className="w-full justify-start"
                  >
                    Export as CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportTransactions('json')}
                    className="w-full justify-start"
                  >
                    Export as JSON
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Summary - Mobile Layout */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{stats.successful}</div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600 truncate">₹{stats.totalAmount}</div>
              <div className="text-xs text-muted-foreground">Total Amount</div>
            </div>
          </div>

          {/* Filters - Mobile Layout */}
          {showFilters && (
            <div className="space-y-2 mt-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
              
              {/* First Row of Filters */}
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    status: value as typeof filters.status 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    paymentMethod: value as PaymentMethod | 'all' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value={PaymentMethod.UPI}>UPI</SelectItem>
                    <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                    <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Second Row of Filters */}
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: value as typeof filters.dateRange 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    sortBy: value as typeof filters.sortBy 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                  }))}
                  className="flex items-center justify-center gap-1"
                >
                  <ArrowUpDown className="h-3 w-3" />
                  <span className="text-xs">{filters.sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">💳</div>
                <p>No transactions found</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => {
                const config = CATEGORY_CONFIG[transaction.category];
                const status = getPaymentStatus(transaction);
                
                return (
                  <div
                    key={transaction.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onTransactionClick?.(transaction)}
                  >
                    {/* Top Row: Icon, Description, Status Icon */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-xl flex-shrink-0">{config.icon}</div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm truncate block">
                            {transaction.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusIcon(transaction)}
                        <div className={`font-semibold text-sm ${getAmountColor(transaction)}`}>
                          {getAmountPrefix(transaction)}₹{transaction.amount}
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Row: Date, Payment Method, Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-1 min-w-0">
                        <span className="truncate">
                          {format(new Date(transaction.date), 'MMM d, HH:mm')}
                        </span>
                        <span>•</span>
                        <span className="truncate">{transaction.paymentMethod}</span>
                        {transaction.merchantName && (
                          <>
                            <span>•</span>
                            <span className="truncate">{transaction.merchantName}</span>
                          </>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {getStatusBadge(transaction)}
                      </div>
                    </div>
                    
                    {/* Transaction ID if exists */}
                    {transaction.upiTransactionId && (
                      <div className="mt-1 text-xs text-muted-foreground font-mono">
                        ID: {transaction.upiTransactionId.slice(-8)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
