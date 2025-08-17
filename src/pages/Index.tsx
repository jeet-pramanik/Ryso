import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNavigation from '@/components/layout/BottomNavigation';
import Dashboard from '@/components/features/dashboard/Dashboard';
import ExpensesPage from '@/components/features/expenses/ExpensesPage';
import PaymentsPage from '@/components/features/payments/PaymentsPage';
import GoalsDashboard from '@/components/features/goals/GoalsDashboard';
import ProfilePage from '@/components/features/profile/ProfilePage';
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
        return <ExpensesPage />;
      case 'pay':
        return <PaymentsPage />;
      case 'goals':
        return <GoalsDashboard />;
      case 'profile':
        return <ProfilePage />;
      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onShowAddExpense={() => setShowAddExpense(true)}
            onShowSendMoney={() => setShowSendMoney(true)}
            onShowCreateGoal={() => setShowCreateGoal(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content Container */}
      <div className="pb-20"> {/* Bottom padding to account for fixed navigation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[calc(100vh-5rem)]" // Ensure content takes full height minus navigation
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleNavigate} />

      {/* Modals - Higher z-index than navigation */}
      <div className="relative z-[200]">
        <AddExpenseModal 
          isOpen={showAddExpense} 
          onClose={() => setShowAddExpense(false)} 
        />
      </div>
    </div>
  );
};

export default Index;