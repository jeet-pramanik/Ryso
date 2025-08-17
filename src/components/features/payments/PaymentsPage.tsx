import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Send, History, Smartphone, CreditCard, Wallet } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SendMoneyModal from './SendMoneyModal';
import { useTransactionStore } from '@/stores/transactionStore';
import { TransactionType } from '@/types';

const quickActions = [
  { id: 'scan', label: 'Scan QR', icon: QrCode, color: 'bg-primary' },
  { id: 'send', label: 'Send Money', icon: Send, color: 'bg-success' },
  { id: 'request', label: 'Request Money', icon: Smartphone, color: 'bg-warning' },
  { id: 'bills', label: 'Pay Bills', icon: CreditCard, color: 'bg-purple-500' }
];

const recentContacts = [
  { id: '1', name: 'Rahul Kumar', upi: 'rahul@paytm', avatar: '👨‍💻' },
  { id: '2', name: 'Priya Sharma', upi: 'priya@gpay', avatar: '👩‍🎓' },
  { id: '3', name: 'Amit Singh', upi: 'amit@phonepe', avatar: '👨‍🎓' },
  { id: '4', name: 'Sneha Patel', upi: 'sneha@paytm', avatar: '👩‍💼' }
];

export default function PaymentsPage() {
  const [showSendMoney, setShowSendMoney] = useState(false);
  const { transactions } = useTransactionStore();

  const paymentTransactions = transactions
    .filter(tx => tx.type === TransactionType.EXPENSE && tx.paymentMethod === 'UPI')
    .slice(0, 5);

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'scan':
        // Demo QR scanner
        alert('QR Scanner would open here in a real app!');
        break;
      case 'send':
        setShowSendMoney(true);
        break;
      case 'request':
        alert('Request Money feature coming soon!');
        break;
      case 'bills':
        alert('Bill Payment feature coming soon!');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Pay" showNotifications={false} />
      
      <main className="pb-24 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">UPI Balance</p>
                <p className="text-2xl font-bold">₹2,450</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="text-white/80">Bank Account</p>
                <p className="font-medium">HDFC Bank •••• 4567</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    onClick={() => handleQuickAction(action.id)}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Contacts</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentContacts.map((contact, index) => (
                <motion.button
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => setShowSendMoney(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {contact.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.upi}</p>
                  </div>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Payments</h3>
              <Button variant="ghost" size="sm">
                <History className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            
            {paymentTransactions.length > 0 ? (
              <div className="space-y-3">
                {paymentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-destructive">-₹{transaction.amount}</p>
                      <p className="text-xs text-success">Success</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">💳</div>
                <p>No recent payments</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <SendMoneyModal 
        isOpen={showSendMoney} 
        onClose={() => setShowSendMoney(false)} 
      />
    </div>
  );
}