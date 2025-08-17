import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Flashlight, RotateCcw, ScanLine } from 'lucide-react';

interface QRData {
  type: 'UPI' | 'UNKNOWN';
  upiId?: string;
  name?: string;
  amount?: number;
  description?: string;
}

interface QRScannerProps {
  onScanSuccess: (data: QRData) => void;
  onClose: () => void;
  isOpen: boolean;
}

const mockQRCodes = [
  {
    type: 'UPI' as const,
    upiId: 'zomato@paytm',
    name: 'Zomato',
    amount: 299,
    description: 'Food order payment'
  },
  {
    type: 'UPI' as const,
    upiId: 'canteen@college.edu',
    name: 'College Canteen',
    amount: 85,
    description: 'Lunch payment'
  },
  {
    type: 'UPI' as const,
    upiId: 'uber@paytm',
    name: 'Uber',
    amount: 120,
    description: 'Ride payment'
  },
  {
    type: 'UPI' as const,
    upiId: 'friend.rahul@phonepe',
    name: 'Rahul Kumar',
    description: 'Split bill payment'
  },
  {
    type: 'UPI' as const,
    upiId: 'amazon@amazonpay',
    name: 'Amazon Pay',
    amount: 499,
    description: 'Online purchase'
  }
];

export function QRScanner({ onScanSuccess, onClose, isOpen }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showScanLine, setShowScanLine] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setShowScanLine(true);
      
      // Simulate camera initialization delay
      const initTimer = setTimeout(() => {
        // Camera "started"
      }, 500);

      return () => clearTimeout(initTimer);
    } else {
      setIsScanning(false);
      setShowScanLine(false);
      setScanProgress(0);
    }
  }, [isOpen]);

  const simulateScan = () => {
    if (!isScanning) return;

    setIsScanning(false);
    setScanProgress(0);

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          
          // Simulate successful scan after progress completes
          setTimeout(() => {
            const randomQR = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
            onScanSuccess(randomQR);
          }, 200);
          
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const resetScan = () => {
    setScanProgress(0);
    setIsScanning(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFlashEnabled(!flashEnabled)}
            className="text-white hover:bg-white/20"
          >
            <Flashlight className={`h-5 w-5 ${flashEnabled ? 'fill-yellow-400' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {/* Simulated Camera Feed */}
        <div 
          ref={videoRef}
          className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 relative"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 1px),
              radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 1px, transparent 1px),
              radial-gradient(circle at 40% 80%, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px, 80px 80px, 120px 120px'
          }}
        >
          {/* Scanning Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Scan Frame */}
              <div className="w-64 h-64 border-2 border-white/80 relative">
                {/* Corner indicators */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-blue-400"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-blue-400"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-blue-400"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-blue-400"></div>
                
                {/* Animated scan line */}
                {showScanLine && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse">
                    <div className="h-full bg-blue-400 opacity-60 animate-bounce"></div>
                  </div>
                )}

                {/* Progress indicator */}
                {scanProgress > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
                      <p className="text-sm">Scanning... {scanProgress}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Simulated QR Code in view (when not scanning) */}
          {isScanning && scanProgress === 0 && (
            <div className="absolute bottom-32 right-8 transform rotate-12">
              <div className="w-24 h-24 bg-white p-2 rounded-lg shadow-lg">
                <div className="w-full h-full bg-black relative">
                  {/* Simple QR code pattern simulation */}
                  <div className="absolute inset-1 grid grid-cols-8 gap-px">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Badge className="mt-1 bg-blue-600 text-white text-xs">
                UPI QR Code
              </Badge>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <div className="text-center space-y-3">
            <p className="text-lg font-medium">
              Position the QR code within the frame
            </p>
            <p className="text-sm text-white/80">
              Make sure the QR code is clearly visible and well-lit
            </p>
            
            {isScanning && scanProgress === 0 && (
              <Button
                onClick={simulateScan}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ScanLine className="h-4 w-4 mr-2" />
                Tap to Scan
              </Button>
            )}

            {scanProgress === 100 && (
              <Button
                onClick={resetScan}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Scan Again
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Flash effect when enabled */}
      {flashEnabled && (
        <div className="absolute inset-0 bg-white opacity-20 pointer-events-none"></div>
      )}
    </div>
  );
}
