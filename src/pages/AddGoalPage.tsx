import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Target, Plane, Smartphone, GraduationCap, Heart, Briefcase, Check } from 'lucide-react';
import { format } from 'date-fns';
import { GoalCategory } from '@/types';
import { useGoalsStore } from '@/stores/goalsStore';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';

interface GoalCategoryOption {
  key: GoalCategory;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  iconName: string;
  description: string;
}

const goalCategories: GoalCategoryOption[] = [
  {
    key: GoalCategory.EMERGENCY,
    label: 'Emergency Fund',
    icon: Heart,
    color: '#ef4444',
    iconName: 'Heart',
    description: 'Financial safety net for unexpected expenses'
  },
  {
    key: GoalCategory.TRAVEL,
    label: 'Travel',
    icon: Plane,
    color: '#3b82f6',
    iconName: 'Plane',
    description: 'Dream vacation or travel adventures'
  },
  {
    key: GoalCategory.GADGET,
    label: 'Gadgets',
    icon: Smartphone,
    color: '#a855f7',
    iconName: 'Smartphone',
    description: 'Latest tech devices and electronics'
  },
  {
    key: GoalCategory.CAREER,
    label: 'Career',
    icon: Briefcase,
    color: '#22c55e',
    iconName: 'Briefcase',
    description: 'Professional development and education'
  },
  {
    key: GoalCategory.OTHER,
    label: 'Other',
    icon: Target,
    color: '#6b7280',
    iconName: 'Target',
    description: 'Custom savings goal'
  }
];

const AddGoalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { createGoal, isLoading } = useGoalsStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: undefined as Date | undefined,
    category: GoalCategory.OTHER
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 2) {
      if (!formData.title.trim()) {
        newErrors.title = 'Goal title is required';
      }
      if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
        newErrors.targetAmount = 'Please enter a valid target amount';
      }
      if (!formData.targetDate) {
        newErrors.targetDate = 'Please select a target date';
      } else if (formData.targetDate <= new Date()) {
        newErrors.targetDate = 'Target date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep(2)) {
        setCurrentStep(3);
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2) || !user?.id) return;

    try {
      const selectedCategoryData = goalCategories.find(cat => cat.key === formData.category);
      
      await createGoal({
        userId: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate!.toISOString(),
        category: formData.category,
        icon: selectedCategoryData?.iconName || 'Target',
        color: selectedCategoryData?.color || '#6b7280'
      });

      navigate('/goals');
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const selectedCategory = goalCategories.find(cat => cat.key === formData.category);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep >= step
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-500"
            )}
          >
            {currentStep > step ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 3 && (
            <div
              className={cn(
                "w-12 h-1 rounded",
                currentStep > step ? "bg-blue-500" : "bg-gray-200"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Choose Category</h2>
        <p className="text-muted-foreground">What are you saving for?</p>
      </div>

      <div className="space-y-3">
        {goalCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = formData.category === category.key;
          
          return (
            <button
              key={category.key}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                isSelected 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
              onClick={() => handleInputChange('category', category.key)}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: category.color }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{category.label}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Goal Details</h2>
        <p className="text-muted-foreground">Set your target and timeline</p>
      </div>

      <div className="space-y-4">
        {/* Goal Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-medium">Goal Title</Label>
          <Input
            id="title"
            placeholder="e.g., New iPhone, Europe Trip, Emergency Fund"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={cn("h-12 text-base", errors.title ? 'border-red-500' : '')}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Target Amount */}
        <div className="space-y-2">
          <Label htmlFor="targetAmount" className="text-base font-medium">Target Amount</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">₹</span>
            <Input
              id="targetAmount"
              type="number"
              placeholder="0"
              value={formData.targetAmount}
              onChange={(e) => handleInputChange('targetAmount', e.target.value)}
              className={cn("pl-10 h-12 text-base", errors.targetAmount ? 'border-red-500' : '')}
              min="1"
              step="0.01"
            />
          </div>
          {errors.targetAmount && (
            <p className="text-sm text-red-500">{errors.targetAmount}</p>
          )}
        </div>

        {/* Target Date */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Target Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal text-base",
                  !formData.targetDate && "text-muted-foreground",
                  errors.targetDate && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-3 h-5 w-5" />
                {formData.targetDate ? format(formData.targetDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.targetDate}
                onSelect={(date) => handleInputChange('targetDate', date)}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.targetDate && (
            <p className="text-sm text-red-500">{errors.targetDate}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-medium">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add more details about your goal..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="min-h-[100px] text-base"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Review Your Goal</h2>
        <p className="text-muted-foreground">Make sure everything looks good</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-4">
          {selectedCategory && (
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: selectedCategory.color }}
            >
              <selectedCategory.icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{formData.title}</h3>
            <p className="text-sm text-muted-foreground">{selectedCategory?.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-muted-foreground">Target Amount</p>
            <p className="font-semibold text-lg">₹{parseFloat(formData.targetAmount || '0').toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target Date</p>
            <p className="font-semibold">
              {formData.targetDate ? format(formData.targetDate, "MMM d, yyyy") : 'Not set'}
            </p>
          </div>
        </div>

        {formData.description && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">{formData.description}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => currentStep === 1 ? navigate('/goals') : setCurrentStep(currentStep - 1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">Create New Goal</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {renderStepIndicator()}
        
        <div className="max-w-md mx-auto">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          {currentStep < 3 ? (
            <Button 
              onClick={handleNext}
              className="w-full h-12 text-base bg-blue-500 hover:bg-blue-600"
              disabled={currentStep === 1 && !formData.category}
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="w-full h-12 text-base bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Goal'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGoalPage;
