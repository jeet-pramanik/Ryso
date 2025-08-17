import { motion } from 'framer-motion';
import { Plus, Send, Target, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'primary' | 'secondary' | 'success' | 'outline';
  onClick: () => void;
}

interface QuickActionsProps {
  onAddExpense: () => void;
  onSendMoney: () => void;
  onCreateGoal: () => void;
  onViewExpenses: () => void;
}

export default function QuickActions({ 
  onAddExpense, 
  onSendMoney, 
  onCreateGoal, 
  onViewExpenses 
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: Plus,
      variant: 'primary',
      onClick: onAddExpense
    },
    {
      id: 'send-money',
      label: 'Send Money',
      icon: Send,
      variant: 'success',
      onClick: onSendMoney
    },
    {
      id: 'create-goal',
      label: 'New Goal',
      icon: Target,
      variant: 'secondary',
      onClick: onCreateGoal
    },
    {
      id: 'view-expenses',
      label: 'View Expenses',
      icon: PieChart,
      variant: 'outline',
      onClick: onViewExpenses
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.div key={action.id} variants={itemVariants}>
              <Button
                onClick={action.onClick}
                variant={action.variant as any}
                className="w-full h-20 flex flex-col items-center justify-center gap-2 hover-scale"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}