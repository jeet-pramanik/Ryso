import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import AppHeader from '@/components/layout/AppHeader';
import BudgetOverview from './BudgetOverview';
import BudgetAlerts from './BudgetAlerts';
import BudgetInsights from './BudgetInsights';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import BudgetSetup from './BudgetSetup';
import BudgetDebugPanel from './BudgetDebugPanel';
import GlobalLoading from '@/components/ui/global-loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onExternalNavigate?: (path: string) => void;
  onShowAddExpense: () => void;
  onShowSendMoney: () => void;
}

export default function Dashboard({ 
  onNavigate, 
  onExternalNavigate,
  onShowAddExpense, 
  onShowSendMoney
}: DashboardProps) {
  const { user, isInitialized, isLoading: userLoading, initializeUser } = useUserStore();
  const { transactions, isHydrated, isLoading: transactionLoading, hydrate } = useTransactionStore();
  const { currentBudget, isHydrated: budgetHydrated, isLoading: budgetLoading, hydrate: hydrateBudget } = useBudgetStore();
  const [initError, setInitError] = useState<string | null>(null);
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setInitError(null);
        
        if (!isInitialized) {
          await initializeUser();
        }
        
        if (!isHydrated) {
          await hydrate();
        }

        if (!budgetHydrated) {
          await hydrateBudget();
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError('Failed to load app data. Please try again.');
      }
    };

    initializeApp();
  }, [isInitialized, isHydrated, budgetHydrated, initializeUser, hydrate, hydrateBudget]);

  // Re-hydrate budget when setup is closed to check for new budget
  useEffect(() => {
    if (!showBudgetSetup && budgetHydrated) {
      // Small delay to ensure budget creation is complete
      const timer = setTimeout(() => {
        hydrateBudget();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [showBudgetSetup, budgetHydrated, hydrateBudget]);

  const handleBudgetSetupComplete = async () => {
    // Force re-hydration of budget data
    await hydrateBudget();
    // Close the setup modal
    setShowBudgetSetup(false);
  };

  const handleQuickActions = {
    onAddExpense: onShowAddExpense,
    onSendMoney: onShowSendMoney,
    onCreateGoal: onExternalNavigate ? () => onExternalNavigate('/add-goal') : () => {},
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

  // Show loading state while initializing
  if (userLoading || transactionLoading || budgetLoading || !isInitialized || !isHydrated || !budgetHydrated) {
    return <GlobalLoading message="Setting up your dashboard..." />;
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground">Oops!</h2>
          <p className="text-muted-foreground">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <GlobalLoading message="Loading user data..." />;
  }

  // Show budget setup if no budget exists
  if (!currentBudget && !showBudgetSetup) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Ryso" />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Card>
              <CardContent className="p-8">
                <div className="text-6xl mb-6">🧠</div>
                <h2 className="text-2xl font-bold mb-4">Welcome to Ryso!</h2>
                <p className="text-muted-foreground mb-8">
                  Your smart money companion is here! Let's set up your budget so I can help make every rupee count toward your goals.
                </p>
                <Button 
                  onClick={() => setShowBudgetSetup(true)}
                  className="w-full"
                  size="lg"
                >
                  Let's Get Started
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show budget setup modal
  if (showBudgetSetup) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Budget Setup" />
        <BudgetSetup 
          isOpen={showBudgetSetup}
          onClose={() => setShowBudgetSetup(false)}
          onComplete={handleBudgetSetupComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Ryso" />
      
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="pb-24 px-4"
      >
        <div className="max-w-md mx-auto space-y-6">
          {/* Budget Alerts */}
          <motion.div variants={itemVariants}>
            <BudgetAlerts />
          </motion.div>

          {/* Budget Overview */}
          <motion.div variants={itemVariants}>
            <BudgetOverview />
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <QuickActions {...handleQuickActions} />
          </motion.div>

          {/* Budget Insights */}
          <motion.div variants={itemVariants}>
            <BudgetInsights />
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
                  onClick={() => onExternalNavigate ? onExternalNavigate('/add-goal') : onNavigate('goals')}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  + Create your first savings goal
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
      
      {/* Debug Panel (always visible in development)
      <BudgetDebugPanel /> */}
      
      
    </div>
  );
}