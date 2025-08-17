import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { QRScanner } from './QRScanner';
import { paymentService, PaymentStep, PaymentResult, UPIContact } from '@/services/payments';
import { transactionRepository } from '@/services/repositories/TransactionRepository';
import { useTransactionStore } from '@/stores/transactionStore';
import { useUserStore } from '@/stores/userStore';
import { PaymentRequest, ExpenseCategory, TransactionType, PaymentMethod } from '@/types';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { 
  ArrowLeft, 
  QrCode, 
  User, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  Star,
  Heart,
  Zap,
  Shield
} from 'lucide-react';

type FlowStep = 'enter' | 'verify' | 'processing' | 'result';

interface PaymentFlowProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: string;
  initialAmount?: number;
  initialDescription?: string;
}

export function PaymentFlow({ 
  isOpen, 
  onClose, 
  initialRecipient = '',
  initialAmount = 0,
  initialDescription = ''
}: PaymentFlowProps) {
  const { toast } = useToast();
  const { hydrate: hydrateTransactions } = useTransactionStore();
  const { user: currentUser } = useUserStore();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>('enter');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>([]);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [savedContacts, setSavedContacts] = useState<UPIContact[]>([]);
  const [recipientName, setRecipientName] = useState<string>('');
  
  const [formData, setFormData] = useState<PaymentRequest>({
    recipientUPI: initialRecipient,
    amount: initialAmount,
    description: initialDescription
  });

  const [errors, setErrors] = useState<{
    recipientUPI?: string;
    amount?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      loadSavedContacts();
      resetFlow();
    }
  }, [isOpen]);

  const loadSavedContacts = () => {
    const contacts = paymentService.getSavedContacts();
    setSavedContacts(contacts);
  };

  const resetFlow = () => {
    setCurrentStep('enter');
    setPaymentSteps([]);
    setActivePaymentId(null);
    setPaymentResult(null);
    setRecipientName('');
    setErrors({});
    setFormData({
      recipientUPI: initialRecipient,
      amount: initialAmount,
      description: initialDescription
    });
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate UPI ID
    const upiValidation = paymentService.validateUPIId(formData.recipientUPI);
    if (!upiValidation.isValid) {
      newErrors.recipientUPI = upiValidation.error;
    }

    // Validate amount
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (formData.amount > 100000) {
      newErrors.amount = 'Amount cannot exceed ₹1,00,000';
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Payment description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Initiate payment process
      const { paymentId, steps } = await paymentService.initiatePayment(formData);
      
      setActivePaymentId(paymentId);
      setPaymentSteps(steps);
      setCurrentStep('verify');

      // Start verification process
      setTimeout(() => {
        handleVerification(paymentId);
      }, 500);

    } catch (error) {
      console.error('Failed to initiate payment:', error);
      toast({
        title: "Error",
        description: "Failed to start payment process",
        variant: "destructive"
      });
    }
  };

  const handleVerification = async (paymentId: string) => {
    try {
      const verification = await paymentService.verifyRecipient(paymentId, formData.recipientUPI);
      
      if (verification.success && verification.recipientName) {
        setRecipientName(verification.recipientName);
        setCurrentStep('processing');
        
        // Start payment processing
        setTimeout(() => {
          handleProcessing(paymentId);
        }, 1000);
      } else {
        // Verification failed
        setCurrentStep('result');
        setPaymentResult({
          success: false,
          message: verification.error || 'Verification failed',
          timestamp: new Date().toISOString(),
          amount: formData.amount,
          recipientUPI: formData.recipientUPI
        });
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setCurrentStep('result');
      setPaymentResult({
        success: false,
        message: 'Network error during verification',
        timestamp: new Date().toISOString(),
        amount: formData.amount,
        recipientUPI: formData.recipientUPI
      });
    }
  };

  const handleProcessing = async (paymentId: string) => {
    try {
      const result = await paymentService.processPayment(paymentId, formData);
      
      setPaymentResult(result);
      setCurrentStep('result');

      // Create transaction if payment successful
      if (result.success && currentUser) {
        await createTransaction(result);
      }

    } catch (error) {
      console.error('Payment processing failed:', error);
      setCurrentStep('result');
      setPaymentResult({
        success: false,
        message: 'Payment processing failed',
        timestamp: new Date().toISOString(),
        amount: formData.amount,
        recipientUPI: formData.recipientUPI
      });
    }
  };

  const createTransaction = async (result: PaymentResult) => {
    if (!currentUser || !result.success) return;

    try {
      const transactionData = {
        amount: result.amount,
        description: formData.description,
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.UPI,
        merchantName: recipientName,
        upiTransactionId: result.transactionId,
        userId: currentUser.id,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Use estimated category if available
      if (result.estimatedCategory) {
        const transaction = {
          ...transactionData,
          id: crypto.randomUUID(),
          category: result.estimatedCategory,
          categoryConfidence: result.confidence || 0.8,
          isManualCategory: false,
          categorizationReason: 'UPI payment auto-categorization'
        };
        
        await transactionRepository.create(transaction);
      } else {
        // Use categorization service
        await transactionRepository.createWithCategorization(transactionData);
      }

      await hydrateTransactions();
      
      toast({
        title: "Transaction Recorded",
        description: "Payment recorded in your expenses"
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast({
        title: "Warning",
        description: "Payment successful but failed to record transaction",
        variant: "destructive"
      });
    }
  };

  const handleQRScan = (qrData: any) => {
    if (qrData.type === 'UPI' && qrData.upiId) {
      setFormData(prev => ({
        ...prev,
        recipientUPI: qrData.upiId,
        amount: qrData.amount || prev.amount,
        description: qrData.description || prev.description
      }));
      
      if (qrData.name) {
        setRecipientName(qrData.name);
      }
    }
    
    setShowQRScanner(false);
    
    toast({
      title: "QR Code Scanned",
      description: "Payment details filled automatically"
    });
  };

  const handleContactSelect = (contact: UPIContact) => {
    setFormData(prev => ({
      ...prev,
      recipientUPI: contact.upiId
    }));
    setRecipientName(contact.name);
  };

  const handleBack = () => {
    if (currentStep === 'verify' || currentStep === 'processing') {
      // Can't go back during active payment
      return;
    }
    
    if (currentStep === 'result') {
      resetFlow();
    }
  };

  const handleClose = () => {
    if (currentStep === 'verify' || currentStep === 'processing') {
      // Warn about cancelling active payment
      if (confirm('Are you sure you want to cancel this payment?')) {
        onClose();
        resetFlow();
      }
    } else {
      onClose();
      resetFlow();
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'enter': return 25;
      case 'verify': return 50;
      case 'processing': return 75;
      case 'result': return 100;
      default: return 0;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4">
        <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(currentStep === 'result' && !paymentResult?.success) && (
                  <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <CardTitle>
                  {currentStep === 'enter' && 'Send Money'}
                  {currentStep === 'verify' && 'Verify Recipient'}
                  {currentStep === 'processing' && 'Processing Payment'}
                  {currentStep === 'result' && (paymentResult?.success ? 'Payment Successful' : 'Payment Failed')}
                </CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={getStepProgress()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Enter</span>
                <span>Verify</span>
                <span>Process</span>
                <span>Complete</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Step 1: Enter Payment Details */}
            {currentStep === 'enter' && (
              <div className="space-y-4">
                {/* UPI ID Input */}
                <div>
                  <label className="text-sm font-medium">Recipient UPI ID</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="username@upi"
                      value={formData.recipientUPI}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        recipientUPI: e.target.value 
                      }))}
                      className={errors.recipientUPI ? 'border-red-500' : ''}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowQRScanner(true)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.recipientUPI && (
                    <p className="text-sm text-red-500 mt-1">{errors.recipientUPI}</p>
                  )}
                </div>

                {/* Saved Contacts */}
                {savedContacts.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Recent Contacts</label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {savedContacts.slice(0, 3).map((contact) => (
                        <Button
                          key={contact.id}
                          variant="outline"
                          className="justify-start p-3 h-auto"
                          onClick={() => handleContactSelect(contact)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{contact.name}</span>
                                {contact.isFavorite && (
                                  <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {contact.upiId}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {contact.transactionCount}
                            </Badge>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <label className="text-sm font-medium">Amount (₹)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      amount: parseFloat(e.target.value) || 0 
                    }))}
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
                  )}
                </div>

                {/* Description Input */}
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="What is this payment for?"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>

                <Button onClick={handleNext} className="w-full" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Pay ₹{formData.amount}
                </Button>
              </div>
            )}

            {/* Step 2: Verify Recipient */}
            {currentStep === 'verify' && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Verifying Recipient</h3>
                  <p className="text-muted-foreground">
                    Please wait while we verify the UPI ID
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">UPI ID</p>
                  <p className="font-medium">{formData.recipientUPI}</p>
                </div>

                {/* Processing Steps */}
                <div className="space-y-2">
                  {paymentSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 text-left">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-100 text-green-600' :
                        step.status === 'active' ? 'bg-blue-100 text-blue-600' :
                        step.status === 'error' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : step.status === 'active' ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : step.status === 'error' ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Processing Payment */}
            {currentStep === 'processing' && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-yellow-600 animate-pulse" />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">Processing Payment</h3>
                  <p className="text-muted-foreground">
                    Your payment is being processed securely
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">To</span>
                    <span className="font-medium">{recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-bold text-lg">₹{formData.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">For</span>
                    <span className="font-medium">{formData.description}</span>
                  </div>
                </div>

                <div className="animate-pulse">
                  <div className="w-8 h-8 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}

            {/* Step 4: Payment Result */}
            {currentStep === 'result' && paymentResult && (
              <div className="space-y-4 text-center">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  paymentResult.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {paymentResult.success ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                
                <div>
                  <h3 className={`font-semibold text-lg ${
                    paymentResult.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
                  </h3>
                  <p className="text-muted-foreground">
                    {paymentResult.message}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  {paymentResult.success && paymentResult.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Transaction ID</span>
                      <span className="font-mono text-sm">{paymentResult.transactionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-bold">₹{paymentResult.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="text-sm">
                      {new Date(paymentResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {paymentResult.estimatedCategory && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <Badge variant="outline">
                        {CATEGORY_CONFIG[paymentResult.estimatedCategory].icon}{' '}
                        {CATEGORY_CONFIG[paymentResult.estimatedCategory].name}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {paymentResult.success ? (
                    <Button onClick={handleClose} className="flex-1">
                      Done
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleBack} className="flex-1">
                        Try Again
                      </Button>
                      <Button onClick={handleClose} className="flex-1">
                        Close
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onScanSuccess={handleQRScan}
        onClose={() => setShowQRScanner(false)}
      />
    </>
  );
}
