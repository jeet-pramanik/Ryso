import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Target, Plane, Smartphone, GraduationCap, Heart, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { GoalCategory } from '@/types';
import { useGoalsStore } from '@/stores/goalsStore';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const AddGoalModal: React.FC<AddGoalModalProps> = ({ open, onOpenChange }) => {
  const { user } = useUserStore();
  const { createGoal, isLoading } = useGoalsStore();

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.id) return;

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

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        targetAmount: '',
        targetDate: undefined,
        category: GoalCategory.OTHER
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const selectedCategory = goalCategories.find(cat => cat.key === formData.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Create New Goal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Category</Label>
            <div className="grid grid-cols-1 gap-2">
              {goalCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = formData.category === category.key;
                
                return (
                  <Card
                    key={category.key}
                    className={cn(
                      "cursor-pointer transition-all border-2",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => handleInputChange('category', category.key)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className={cn("p-2 rounded-lg")} style={{ backgroundColor: category.color }}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-sm">{category.label}</h3>
                            {isSelected && (
                              <Badge variant="default" className="text-xs">Selected</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Goal Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Goal Title</Label>
            <Input
              id="title"
              placeholder="e.g., New iPhone, Europe Trip, Emergency Fund"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details about your goal..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="targetAmount" className="text-sm font-medium">Target Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                id="targetAmount"
                type="number"
                placeholder="0"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                className={cn("pl-8", errors.targetAmount ? 'border-red-500' : '')}
                min="1"
                step="0.01"
              />
            </div>
            {errors.targetAmount && (
              <p className="text-xs text-red-500">{errors.targetAmount}</p>
            )}
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.targetDate && "text-muted-foreground",
                    errors.targetDate && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
              <p className="text-xs text-red-500">{errors.targetDate}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Goal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalModal;
