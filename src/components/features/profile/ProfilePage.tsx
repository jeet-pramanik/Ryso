import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  Download, 
  LogOut,
  Edit3,
  CreditCard,
  PieChart,
  Target
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUserStore } from '@/stores/userStore';
import { useTransactionStore } from '@/stores/transactionStore';

const menuItems = [
  {
    id: 'edit-profile',
    label: 'Edit Profile',
    icon: Edit3,
    description: 'Update your personal information',
    action: () => alert('Edit Profile feature coming soon!')
  },
  {
    id: 'budget-settings',
    label: 'Budget Settings',
    icon: PieChart,
    description: 'Manage your monthly budget',
    action: () => alert('Budget Settings feature coming soon!')
  },
  {
    id: 'goal-preferences',
    label: 'Goal Preferences',
    icon: Target,
    description: 'Customize your savings goals',
    action: () => alert('Goal Preferences feature coming soon!')
  },
  {
    id: 'payment-methods',
    label: 'Payment Methods',
    icon: CreditCard,
    description: 'Manage your cards and UPI',
    action: () => alert('Payment Methods feature coming soon!')
  }
];

const supportItems = [
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    description: 'Get help with AMPP',
    action: () => alert('Help & Support feature coming soon!')
  },
  {
    id: 'export',
    label: 'Export Data',
    icon: Download,
    description: 'Download your financial data',
    action: () => alert('Data Export feature coming soon!')
  }
];

export default function ProfilePage() {
  const { user } = useUserStore();
  const { transactions } = useTransactionStore();
  
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false
  });

  const [privacy, setPrivacy] = useState({
    hideSensitiveInfo: false,
    requireAuth: true
  });

  const totalTransactions = transactions.length;
  const totalSpent = transactions
    .filter(tx => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const accountAge = user ? 
    Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Profile" showNotifications={false} />
      
      <main className="pb-24 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{user?.name || 'Student User'}</h2>
                <p className="text-muted-foreground">{user?.email || 'student@college.edu'}</p>
                <p className="text-sm text-muted-foreground">{user?.phone || '+91 98765 43210'}</p>
              </div>
              <Button variant="ghost" size="icon">
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{totalTransactions}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">₹{Math.round(totalSpent / 1000)}K</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{accountAge}</p>
                <p className="text-xs text-muted-foreground">Days Active</p>
              </div>
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Account Settings</h3>
            
            <div className="space-y-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Budget Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when you exceed budget</p>
                </div>
                <Switch
                  checked={notifications.budgetAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, budgetAlerts: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Goal Reminders</p>
                  <p className="text-sm text-muted-foreground">Remind me to save for my goals</p>
                </div>
                <Switch
                  checked={notifications.goalReminders}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, goalReminders: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Get weekly spending summary</p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                  }
                />
              </div>
            </div>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Privacy & Security</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Hide Sensitive Info</p>
                  <p className="text-sm text-muted-foreground">Blur amounts and balances</p>
                </div>
                <Switch
                  checked={privacy.hideSensitiveInfo}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, hideSensitiveInfo: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Require Authentication</p>
                  <p className="text-sm text-muted-foreground">Use PIN/biometric to open app</p>
                </div>
                <Switch
                  checked={privacy.requireAuth}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, requireAuth: checked }))
                  }
                />
              </div>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Support</h3>
            
            <div className="space-y-3">
              {supportItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-primary">A</span>
              </div>
              <h4 className="font-semibold text-foreground">AMPP FinTech</h4>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              <p className="text-xs text-muted-foreground">
                Smart financial management for students
              </p>
            </div>
            
            <Button
              variant="outline"
              className="w-full mt-4 text-destructive border-destructive hover:bg-destructive hover:text-white"
              onClick={() => {
                if (confirm('Are you sure you want to sign out?')) {
                  alert('Sign out functionality would work here in a real app!');
                }
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}