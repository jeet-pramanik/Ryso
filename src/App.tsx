import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResponsiveContainer from "@/components/layout/ResponsiveContainer";
import Index from "./pages/Index";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import AddGoalPage from "./pages/AddGoalPage";
import GoalDetailPage from "./pages/GoalDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ResponsiveContainer>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/expenses" element={<Index />} />
              <Route path="/pay" element={<Index />} />
              <Route path="/goals" element={<Index />} />
              <Route path="/profile" element={<Index />} />
              <Route path="/payment-history" element={<PaymentHistoryPage />} />
              <Route path="/add-goal" element={<AddGoalPage />} />
              <Route path="/goals/:goalId" element={<GoalDetailPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ResponsiveContainer>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
