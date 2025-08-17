import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactionStore } from '@/stores/transactionStore';
import { Transaction, TransactionType, PaymentMethod } from '@/types';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowUpDown,
  Calendar,
  CreditCard,
  Smartphone,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';

interface FilterState {
  search: string;
  status: 'all' | 'success' | 'failed' | 'pending';
  paymentMethod: PaymentMethod | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  sortBy: 'date' | 'amount' | 'merchant';
  sortOrder: 'asc' | 'desc';
  amountRange: {
    min: number;
    max: number;
  };
}

// Mock payment status for demonstration
const getPaymentStatus = (transaction: Transaction): 'success' | 'failed' | 'pending' => {
  if (transaction.paymentMethod === PaymentMethod.UPI) {
    return Math.random() > 0.05 ? 'success' : 'failed';
  }
  return 'success';
};

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    paymentMethod: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    amountRange: { min: 0, max: 100000 }
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Filter transactions to payment-related only
  const paymentTransactions = useMemo(() => {
    return transactions.filter(tx => 
      tx.paymentMethod === PaymentMethod.UPI || 
      tx.type === TransactionType.EXPENSE
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...paymentTransactions];

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

    // Amount range filter
    filtered = filtered.filter(tx => 
      tx.amount >= filters.amountRange.min && 
      tx.amount <= filters.amountRange.max
    );

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate = startOfDay(now);
          break;
        case 'week':
          cutoffDate = subWeeks(now, 1);
          break;
        case 'month':
          cutoffDate = subMonths(now, 1);
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
        case 'merchant':
          aValue = a.merchantName || a.description;
          bValue = b.merchantName || b.description;
          break;
        case 'date':
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [paymentTransactions, filters]);

  const stats = useMemo(() => {
    const total = filteredTransactions.length;
    const successful = filteredTransactions.filter(tx => getPaymentStatus(tx) === 'success').length;
    const failed = filteredTransactions.filter(tx => getPaymentStatus(tx) === 'failed').length;
    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    
    const categoryBreakdown = filteredTransactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return { 
      total, 
      successful, 
      failed, 
      totalAmount, 
      avgAmount,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      categoryBreakdown
    };
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
        return <Badge className="bg-green-100 text-green-800 text-xs">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
    }
  };

  const exportTransactions = (exportFormat: 'csv' | 'json') => {
    const dataStr = exportFormat === 'json' 
      ? JSON.stringify(filteredTransactions, null, 2)
      : generateCSV(filteredTransactions);
    
    const dataUri = 'data:text/' + exportFormat + ';charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `payment_history_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
    
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

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      paymentMethod: 'all',
      dateRange: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
      amountRange: { min: 0, max: 100000 }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Payment History</h1>
              <p className="text-xs text-muted-foreground">
                {stats.total} transactions • ₹{stats.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                <Download className="h-4 w-4" />
              </Button>
              {showExportOptions && (
                <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-lg p-2 z-10 min-w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportTransactions('csv')}
                    className="w-full justify-start text-xs"
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportTransactions('json')}
                    className="w-full justify-start text-xs"
                  >
                    Export JSON
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4 pb-24 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-lg font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Payment</p>
                  <p className="text-lg font-bold text-blue-600">₹{stats.avgAmount.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Toggle */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            {(filters.status !== 'all' || filters.paymentMethod !== 'all' || filters.dateRange !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <Card>
              <CardContent className="p-4 space-y-3">
                {/* Status and Payment Method */}
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
                
                {/* Date Range and Sort */}
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
                      <SelectItem value="merchant">Merchant</SelectItem>
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
                    <span className="text-xs">{filters.sortOrder.toUpperCase()}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Transaction List */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No transactions found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction, index) => {
              const config = CATEGORY_CONFIG[transaction.category];
              
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-3">
                      {/* Top Row: Icon, Description, Status, Amount */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-lg flex-shrink-0">{config.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {transaction.description}
                            </div>
                            {transaction.merchantName && (
                              <div className="text-xs text-muted-foreground truncate">
                                {transaction.merchantName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusIcon(transaction)}
                          <div className="text-right">
                            <div className="font-semibold text-sm text-red-600">
                              -₹{transaction.amount}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Row: Date, Payment Method, Category, Status Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-1 min-w-0">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(transaction.date), 'MMM d, HH:mm')}</span>
                          <span>•</span>
                          {transaction.paymentMethod === PaymentMethod.UPI ? (
                            <Smartphone className="h-3 w-3" />
                          ) : (
                            <CreditCard className="h-3 w-3" />
                          )}
                          <span className="truncate">{transaction.paymentMethod}</span>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {getStatusBadge(transaction)}
                        </div>
                      </div>
                      
                      {/* Transaction ID if exists */}
                      {transaction.upiTransactionId && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground font-mono">
                            ID: {transaction.upiTransactionId}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Load More (if needed) */}
        {filteredTransactions.length > 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Showing {filteredTransactions.length} of {paymentTransactions.length} transactions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
