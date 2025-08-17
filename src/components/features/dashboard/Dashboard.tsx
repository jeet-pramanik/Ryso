import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { useTransactionStore } from '@/stores/transactionStore';
import AppHeader from '@/components/layout/AppHeader';
import BudgetOverview from './BudgetOverview';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onShowAddExpense: () => void;
  onShowSendMoney: () => void;
  onShowCreateGoal: () => void;
}

export default function Dashboard({ 
  onNavigate, 
  onShowAddExpense, 
  onShowSendMoney, 
  onShowCreateGoal 
}: DashboardProps) {
  const { user, initializeUser } = useUserStore();
  const { transactions, loadDemoTransactions } = useTransactionStore();

  useEffect(() => {
    // Initialize user and load demo data
    initializeUser();
    if (transactions.length === 0) {
      loadDemoTransactions();
    }
  }, [initializeUser, loadDemoTransactions, transactions.length]);

  const handleQuickActions = {
    onAddExpense: onShowAddExpense,
    onSendMoney: onShowSendMoney,
    onCreateGoal: onShowCreateGoal,
    onViewExpenses: () => onNavigate('expenses')
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="AMPP" />
      
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pb-24 px-4"
      >
        <div className="max-w-md mx-auto space-y-6">
          {/* Budget Overview */}
          <motion.div variants={itemVariants}>
            <BudgetOverview />
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <QuickActions {...handleQuickActions} />
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={itemVariants}>
            <RecentTransactions onViewAll={() => onNavigate('expenses')} />
          </motion.div>

          {/* Savings Goals Preview */}
          <motion.div variants={itemVariants} className="card-elevated">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Savings Goals</h3>
              <button 
                onClick={() => onNavigate('goals')}
                className="text-primary text-sm font-medium hover:underline"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Demo goal preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/20">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-lg">
                  🛡️
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Emergency Fund</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>₹1,750 of ₹5,000</span>
                    <span>•</span>
                    <span>35% complete</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-success/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-success">35%</span>
                </div>
              </div>
              
              <div className="text-center py-4">
                <button 
                  onClick={onShowCreateGoal}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  + Create your first savings goal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}