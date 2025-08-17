import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  PiggyBank,
  Calculator,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useBudgetStore } from "@/stores/budgetStore";
import { useUserStore } from "@/stores/userStore";
import { ExpenseCategory } from "@/types";
import {
  CATEGORY_CONFIG,
  DEFAULT_CATEGORY_BUDGETS,
} from "@/constants/categories";
import { cn } from "@/lib/utils";

interface BudgetSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type SetupStep = "welcome" | "monthly" | "categories" | "review" | "complete";

export default function BudgetSetup({
  isOpen,
  onClose,
  onComplete,
}: BudgetSetupProps) {
  const [step, setStep] = useState<SetupStep>("welcome");
  const [monthlyBudget, setMonthlyBudget] = useState(8000);
  const [categoryAllocations, setCategoryAllocations] = useState<
    Record<ExpenseCategory, number>
  >(DEFAULT_CATEGORY_BUDGETS);
  const [isCreating, setIsCreating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const { createBudget } = useBudgetStore();
  const { updateUser } = useUserStore();

  const steps: SetupStep[] = [
    "welcome",
    "monthly",
    "categories",
    "review",
    "complete",
  ];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const totalAllocated = Object.values(categoryAllocations).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const isAllocationValid = totalAllocated <= monthlyBudget;

  const handleCategoryChange = (category: ExpenseCategory, amount: number) => {
    setCategoryAllocations((prev) => ({
      ...prev,
      [category]: Math.max(0, amount),
    }));
  };

  const handleAutoAllocate = () => {
    const totalCategories = Object.keys(categoryAllocations).length;
    const baseAmount = Math.floor(monthlyBudget / totalCategories);
    const remainder = monthlyBudget % totalCategories;

    const newAllocations = {} as Record<ExpenseCategory, number>;
    Object.keys(categoryAllocations).forEach((category, index) => {
      newAllocations[category as ExpenseCategory] =
        baseAmount + (index < remainder ? 1 : 0);
    });

    setCategoryAllocations(newAllocations);
  };

  const handleCreateBudget = async () => {
    try {
      setIsCreating(true);

      // Create budget
      await createBudget(monthlyBudget, categoryAllocations);

      // Update user's monthly budget preference
      await updateUser({ monthlyBudget });

      setStep("complete");
      setIsFinished(true);
    } catch (error) {
      console.error("Failed to create budget:", error);
      alert("Failed to create budget. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleComplete = () => {
    // Reset the component state
    resetSetup();
    setIsFinished(false);
    // Call completion handler if provided
    if (onComplete) {
      onComplete();
    } else {
      // Fallback: close the setup and let Dashboard re-render with new budget
      onClose();
    }
  };

  const resetSetup = () => {
    setStep("welcome");
    setMonthlyBudget(8000);
    setCategoryAllocations(DEFAULT_CATEGORY_BUDGETS);
    setIsCreating(false);
    setIsFinished(false);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const renderStep = () => {
    switch (step) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <PiggyBank className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Set Up Your Budget
              </h3>
              <p className="text-muted-foreground">
                Let's create a personalized budget to help you track and manage
                your expenses effectively.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-2">
                  <Calculator className="h-6 w-6 text-success" />
                </div>
                <p className="text-sm font-medium">Smart Allocation</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-warning" />
                </div>
                <p className="text-sm font-medium">Real-time Tracking</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Goal Achievement</p>
              </div>
            </div>

            <Button
              onClick={() => setStep("monthly")}
              className="w-full btn-primary"
            >
              Get Started
            </Button>
          </div>
        );

      case "monthly":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Set Monthly Budget</h3>
              <p className="text-muted-foreground">
                How much do you want to budget for this month?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="monthlyBudget">Monthly Budget (₹)</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) =>
                    setMonthlyBudget(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="input-field text-lg font-semibold"
                  min="0"
                />
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Recommended for students:</span>
                  <span className="font-medium">₹5,000 - ₹12,000</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[5000, 8000, 12000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setMonthlyBudget(amount)}
                      className={cn(
                        "p-2 rounded-lg text-sm font-medium transition-colors",
                        monthlyBudget === amount
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted"
                      )}
                    >
                      ₹{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep("welcome")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("categories")}
                className="flex-1 btn-primary"
                disabled={monthlyBudget <= 0}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case "categories":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                Allocate by Category
              </h3>
              <p className="text-muted-foreground">
                Distribute your ₹{monthlyBudget.toLocaleString()} budget across
                categories
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">
                    Allocated: ₹{totalAllocated.toLocaleString()}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      isAllocationValid ? "text-success" : "text-destructive"
                    )}
                  >
                    {isAllocationValid
                      ? `₹${(
                          monthlyBudget - totalAllocated
                        ).toLocaleString()} remaining`
                      : `₹${(
                          totalAllocated - monthlyBudget
                        ).toLocaleString()} over budget`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoAllocate}
                >
                  Auto Allocate
                </Button>
              </div>

              <div className="space-y-3">
                {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
                  const cat = category as ExpenseCategory;
                  const amount = categoryAllocations[cat];
                  const percentage =
                    monthlyBudget > 0 ? (amount / monthlyBudget) * 100 : 0;

                  return (
                    <div
                      key={category}
                      className="flex items-center gap-3 p-3 rounded-xl border"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{
                          backgroundColor: `${config.color}20`,
                          color: config.color,
                        }}
                      >
                        {config.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{config.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) =>
                              handleCategoryChange(
                                cat,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="h-8 text-sm"
                            min="0"
                          />
                          <span className="text-sm text-muted-foreground">
                            ₹
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep("monthly")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("review")}
                className="flex-1 btn-primary"
                disabled={!isAllocationValid}
              >
                Review
              </Button>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Review Your Budget</h3>
              <p className="text-muted-foreground">
                Confirm your budget setup before creating
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Monthly Budget</span>
                  <span className="text-lg font-bold text-primary">
                    ₹{monthlyBudget.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Category Allocations</h4>
                {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
                  const cat = category as ExpenseCategory;
                  const amount = categoryAllocations[cat];
                  const percentage = (amount / monthlyBudget) * 100;

                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: config.color }}>
                          {config.icon}
                        </span>
                        <span className="text-sm">{config.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">
                          ₹{amount.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep("categories")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateBudget}
                className="flex-1 btn-primary"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Budget"}
              </Button>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Budget Created!
              </h3>
              <p className="text-muted-foreground">
                Your budget is now active and ready to help you track your
                spending.
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-2">What's next?</p>
              <ul className="text-sm space-y-1">
                <li>• Add expenses to see real-time tracking</li>
                <li>• Get alerts when you approach limits</li>
                <li>• View insights and spending patterns</li>
              </ul>
            </div>

            <Button onClick={handleComplete} className="w-full btn-primary">
              Start Tracking
            </Button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            {step !== "complete" && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <PiggyBank className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Budget Setup
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Step {currentStepIndex + 1} of {steps.length}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step !== "complete" && (
              <div className="mb-6">
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {renderStep()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
