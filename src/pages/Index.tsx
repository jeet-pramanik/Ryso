import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavigation from '@/components/layout/BottomNavigation';
import Dashboard from '@/components/features/dashboard/Dashboard';
import AddExpenseModal from '@/components/modals/AddExpenseModal';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onShowAddExpense={() => setShowAddExpense(true)}
            onShowSendMoney={() => setShowSendMoney(true)}
            onShowCreateGoal={() => setShowCreateGoal(true)}
          />
        );
      case 'expenses':
        return (
          <div className="min-h-screen bg-background pt-20 pb-24 px-4">
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Expenses View</h2>
                <p className="text-muted-foreground">Coming soon! Your expense categories and detailed analytics will appear here.</p>
              </motion.div>
            </div>
          </div>
        );
      case 'pay':
        return (
          <div className="min-h-screen bg-background pt-20 pb-24 px-4">
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💳</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">UPI Payments</h2>
                <p className="text-muted-foreground">Coming soon! Send money, pay bills, and manage your UPI transactions.</p>
              </motion.div>
            </div>
          </div>
        );
      case 'goals':
        return (
          <div className="min-h-screen bg-background pt-20 pb-24 px-4">
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Savings Goals</h2>
                <p className="text-muted-foreground">Coming soon! Set and track your savings goals with milestone rewards.</p>
              </motion.div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="min-h-screen bg-background pt-20 pb-24 px-4">
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👤</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Profile & Settings</h2>
                <p className="text-muted-foreground">Coming soon! Manage your profile, preferences, and app settings.</p>
              </motion.div>
            </div>
          </div>
        );
      default:
        return <Dashboard onNavigate={handleNavigate} onShowAddExpense={() => setShowAddExpense(true)} onShowSendMoney={() => setShowSendMoney(true)} onShowCreateGoal={() => setShowCreateGoal(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <BottomNavigation activeTab={activeTab} onTabChange={handleNavigate} />

      {/* Modals */}
      <AddExpenseModal 
        isOpen={showAddExpense} 
        onClose={() => setShowAddExpense(false)} 
      />

      {/* Placeholder for other modals */}
      {showSendMoney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSendMoney(false)}
          />
          <div className="relative bg-card rounded-2xl p-6 shadow-xl border border-border max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Send Money</h2>
            <p className="text-muted-foreground mb-4">UPI payment functionality coming soon!</p>
            <button 
              onClick={() => setShowSendMoney(false)}
              className="btn-primary w-full"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showCreateGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateGoal(false)}
          />
          <div className="relative bg-card rounded-2xl p-6 shadow-xl border border-border max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Savings Goal</h2>
            <p className="text-muted-foreground mb-4">Goal creation and tracking functionality coming soon!</p>
            <button 
              onClick={() => setShowCreateGoal(false)}
              className="btn-primary w-full"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;