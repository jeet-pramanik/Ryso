import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { PaymentDashboard } from './PaymentDashboard';

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Pay" showNotifications={false} />
      
      <main className="pb-20 px-4"> {/* Changed from pb-24 to pb-20 for consistency */}
        <div className="max-w-md mx-auto">
          <PaymentDashboard />
        </div>
      </main>
    </div>
  );
}