import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Calendar, Filter, TrendingUp, ArrowUpRight } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { useTransactionStore } from '@/stores/transactionStore';
import { ExpenseCategory, TransactionType } from '@/types';
import { cn } from '@/lib/utils';

const categoryData = {
  [ExpenseCategory.FOOD]: { name: 'Food', icon: '🍕', color: '#F59E0B' },
  [ExpenseCategory.TRANSPORT]: { name: 'Transport', icon: '🚕', color: '#0D94FB' },
  [ExpenseCategory.HOSTEL]: { name: 'Hostel', icon: '🏠', color: '#7C3AED' },
  [ExpenseCategory.BOOKS]: { name: 'Books', icon: '📚', color: '#10B981' },
  [ExpenseCategory.ENTERTAINMENT]: { name: 'Entertainment', icon: '🎬', color: '#EC4899' },
  [ExpenseCategory.EMERGENCY]: { name: 'Emergency', icon: '🚨', color: '#EF4444' }
};

export default function ExpensesPage() {
  const { transactions } = useTransactionStore();
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year'>('month');

  const expenseTransactions = transactions.filter(tx => tx.type === TransactionType.EXPENSE);

  const categoryStats = useMemo(() => {
    const stats = Object.values(ExpenseCategory).map(category => {
      const categoryTransactions = expenseTransactions.filter(tx => tx.category === category);
      const total = categoryTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const count = categoryTransactions.length;
      
      return {
        category,
        name: categoryData[category].name,
        icon: categoryData[category].icon,
        color: categoryData[category].color,
        total,
        count,
        percentage: total > 0 ? (total / expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0)) * 100 : 0
      };
    }).filter(stat => stat.total > 0).sort((a, b) => b.total - a.total);

    return stats;
  }, [expenseTransactions]);

  const chartData = categoryStats.map(stat => ({
    name: stat.name,
    value: stat.total,
    color: stat.color
  }));

  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTransactions = expenseTransactions.filter(tx => 
        tx.date.startsWith(date)
      );
      const total = dayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      return {
        date: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
        amount: total
      };
    });
  }, [expenseTransactions]);

  const totalSpent = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const avgDaily = totalSpent / 30; // Last 30 days average

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Expenses" showNotifications={false} />
      
      <main className="pb-24 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Overview Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-foreground">₹{totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Avg</p>
                  <p className="text-xl font-bold text-foreground">₹{Math.round(avgDaily)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Category Breakdown Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Category Breakdown</h3>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                This Month
              </Button>
            </div>

            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No expenses to show</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Category List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Categories</h3>
            
            <div className="space-y-3">
              {categoryStats.map((stat, index) => (
                <motion.div
                  key={stat.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                    >
                      {stat.icon}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{stat.name}</p>
                      <p className="text-sm text-muted-foreground">{stat.count} transactions</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{stat.total.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{stat.percentage.toFixed(1)}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Trend</h3>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value}`, 'Spent']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="amount" fill="#0D94FB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}