import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentFlow } from './PaymentFlow';
import { PaymentSuccess } from './PaymentSuccess';
import { paymentService, UPIContact, PaymentResult } from '@/services/payments';
import { useTransactionStore } from '@/stores/transactionStore';
import { Transaction, TransactionType, PaymentMethod } from '@/types';
import { 
  Send, 
  QrCode, 
  Users, 
  History, 
  TrendingUp, 
  Zap,
  CreditCard,
  Smartphone,
  Wallet,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

export function PaymentDashboard() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentResult | null>(null);
  const [savedContacts, setSavedContacts] = useState<UPIContact[]>([]);

  React.useEffect(() => {
    loadSavedContacts();
  }, []);

  const loadSavedContacts = () => {
    const contacts = paymentService.getSavedContacts();
    setSavedContacts(contacts);
  };

  const paymentTransactions = useMemo(() => {
    return transactions.filter(tx => 
      tx.paymentMethod === PaymentMethod.UPI || 
      tx.type === TransactionType.EXPENSE
    );
  }, [transactions]);

  const stats = useMemo(() => {
    const thisMonth = format(new Date(), 'yyyy-MM');
    const thisMonthTransactions = paymentTransactions.filter(tx => 
      tx.date.startsWith(thisMonth)
    );
    
    const totalPayments = thisMonthTransactions.length;
    const totalAmount = thisMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const upiPayments = thisMonthTransactions.filter(tx => tx.paymentMethod === PaymentMethod.UPI).length;
    const avgPayment = totalPayments > 0 ? totalAmount / totalPayments : 0;
    
    // Calculate success rate (simulated)
    const successRate = 95; // Based on service configuration
    
    return {
      totalPayments,
      totalAmount,
      upiPayments,
      avgPayment,
      successRate
    };
  }, [paymentTransactions]);

  const recentTransactions = useMemo(() => {
    return paymentTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [paymentTransactions]);

  const favoriteContacts = useMemo(() => {
    return savedContacts.filter(contact => contact.isFavorite).slice(0, 4);
  }, [savedContacts]);

  const handleQuickPay = (contact: UPIContact) => {
    // Pre-fill payment flow with contact details
    setShowPaymentFlow(true);
  };

  const handlePaymentComplete = (result: PaymentResult) => {
    setShowPaymentFlow(false);
    if (result.success) {
      setPaymentSuccess(result);
      loadSavedContacts(); // Refresh contacts
    }
  };

  const quickActions = [
    {
      icon: Send,
      label: 'Send Money',
      description: 'Send to UPI ID or scan QR',
      color: 'bg-blue-500',
      onClick: () => setShowPaymentFlow(true)
    },
    {
      icon: QrCode,
      label: 'Scan & Pay',
      description: 'Scan QR code to pay',
      color: 'bg-green-500',
      onClick: () => setShowPaymentFlow(true) // Will open with QR scanner
    },
    {
      icon: Users,
      label: 'Pay Contacts',
      description: 'Pay saved contacts',
      color: 'bg-purple-500',
      onClick: () => {} // Could open contacts modal
    },
    {
      icon: History,
      label: 'Payment History',
      description: 'View all transactions',
      color: 'bg-orange-500',
      onClick: () => navigate('/payment-history')
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-4"> {/* Reduced space-y-6 to space-y-4 for mobile */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Payments</h1> {/* Reduced from text-2xl */}
          <p className="text-sm text-muted-foreground"> {/* Reduced from base size */}
            Send money, scan QR codes, and manage payment history
          </p>
        </div>
        <Button onClick={() => setShowPaymentFlow(true)} className="flex items-center gap-2" size="sm"> {/* Added size="sm" */}
          <Send className="h-4 w-4" />
          Send Money
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-2 gap-3"> {/* Changed from grid-cols-1 md:grid-cols-2 lg:grid-cols-4 to always 2 cols, reduced gap */}
        <Card>
          <CardContent className="pt-4 pb-4"> {/* Reduced padding */}
            <div className="flex items-center gap-2"> {/* Reduced gap */}
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"> {/* Reduced size */}
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p> {/* Reduced font size */}
                <p className="text-lg font-bold">{stats.totalPayments}</p> {/* Reduced from text-xl */}
                <p className="text-xs text-muted-foreground">payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="text-lg font-bold">₹{stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">UPI Payments</p>
                <p className="text-lg font-bold">{stats.upiPayments}</p>
                <p className="text-xs text-muted-foreground">via UPI</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-lg font-bold">{stats.successRate}%</p>
                <p className="text-xs text-muted-foreground">reliability</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3"> {/* Reduced padding */}
          <CardTitle className="flex items-center gap-2 text-lg"> {/* Reduced from base size */}
            <Zap className="h-4 w-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3"> {/* Always 2 columns for mobile, reduced gap */}
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                onClick={action.onClick}
              >
                <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-xs">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Contacts */}
      {favoriteContacts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-4 w-4" />
              Favorite Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {favoriteContacts.map((contact) => (
                <Button
                  key={contact.id}
                  variant="outline"
                  className="w-full justify-start p-3 h-auto"
                  onClick={() => handleQuickPay(contact)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-sm truncate">{contact.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{contact.upiId}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {contact.transactionCount}
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-4 w-4" />
              Recent Payments
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/payment-history')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent payments</p>
              <p className="text-xs">Start by sending your first payment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* Top row: Icon, Description, Amount */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {transaction.paymentMethod === PaymentMethod.UPI ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{transaction.description}</div>
                      </div>
                    </div>
                    <div className="font-semibold text-red-600 text-sm">
                      -₹{transaction.amount}
                    </div>
                  </div>
                  
                  {/* Bottom row: Date, Method, Merchant */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground truncate flex-1">
                      {format(new Date(transaction.date), 'MMM d, HH:mm')}
                      {transaction.merchantName && ` • ${transaction.merchantName}`}
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      {transaction.paymentMethod}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Flow Modal */}
      <PaymentFlow
        isOpen={showPaymentFlow}
        onClose={() => setShowPaymentFlow(false)}
      />

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4">
          <PaymentSuccess
            paymentResult={paymentSuccess}
            onClose={() => setPaymentSuccess(null)}
            onShareReceipt={() => {
              // Implement share functionality
              console.log('Share receipt');
            }}
            onDownloadReceipt={() => {
              // Implement download functionality
              console.log('Download receipt');
            }}
          />
        </div>
      )}
    </div>
  );
}
