import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentResult } from '@/services/payments';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { CheckCircle, Download, Share, Copy, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentSuccessProps {
  paymentResult: PaymentResult;
  onClose: () => void;
  onShareReceipt?: () => void;
  onDownloadReceipt?: () => void;
}

export function PaymentSuccess({
  paymentResult,
  onClose,
  onShareReceipt,
  onDownloadReceipt
}: PaymentSuccessProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (paymentResult.success) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentResult.success]);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm:ss');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative overflow-hidden">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`
                }}
              >
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </div>
            ))}
          </div>
        )}

        <CardContent className="pt-8 pb-6">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center relative">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping"></div>
            </div>

            {/* Success Message */}
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground">
                Your payment has been processed successfully
              </p>
            </div>

            {/* Payment Details Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 space-y-3 text-left">
              {/* Amount */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  ₹{paymentResult.amount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Paid to {paymentResult.recipientUPI}
                </div>
              </div>

              <div className="border-t border-green-200 pt-3 space-y-2">
                {/* Transaction ID */}
                {paymentResult.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Transaction ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{paymentResult.transactionId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(paymentResult.transactionId!, 'transactionId')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {copiedField === 'transactionId' && (
                        <span className="text-xs text-green-600">Copied!</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Date & Time */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date & Time</span>
                  <span className="text-sm font-medium">
                    {formatDateTime(paymentResult.timestamp)}
                  </span>
                </div>

                {/* Category (if estimated) */}
                {paymentResult.estimatedCategory && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <span>{CATEGORY_CONFIG[paymentResult.estimatedCategory].icon}</span>
                      <span>{CATEGORY_CONFIG[paymentResult.estimatedCategory].name}</span>
                      {paymentResult.confidence && (
                        <span className="text-xs">
                          ({Math.round(paymentResult.confidence * 100)}%)
                        </span>
                      )}
                    </Badge>
                  </div>
                )}

                {/* Status */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary Actions */}
              <div className="grid grid-cols-2 gap-3">
                {onShareReceipt && (
                  <Button variant="outline" onClick={onShareReceipt} className="flex items-center gap-2">
                    <Share className="h-4 w-4" />
                    Share
                  </Button>
                )}
                {onDownloadReceipt && (
                  <Button variant="outline" onClick={onDownloadReceipt} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>

              {/* Done Button */}
              <Button onClick={onClose} className="w-full" size="lg">
                Done
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <p className="mb-1">✅ Transaction recorded in your expenses</p>
              <p>📧 Receipt sent to your registered email</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
