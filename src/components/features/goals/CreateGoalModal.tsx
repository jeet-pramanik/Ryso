import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { goalTemplates } from '@/services/demoData';
import { GoalTemplate } from '@/types';
import { cn } from '@/lib/utils';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGoalModal({ isOpen, onClose }: CreateGoalModalProps) {
  const [step, setStep] = useState<'template' | 'custom' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    icon: '🎯'
  });

  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      targetAmount: template.targetAmount.toString(),
      targetDate: new Date(Date.now() + template.suggestedDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      icon: template.icon
    });
    setStep('details');
  };

  const handleCustomGoal = () => {
    setSelectedTemplate(null);
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      icon: '🎯'
    });
    setStep('custom');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, just show success and close
    alert('Goal created successfully! (Demo mode)');
    onClose();
    resetModal();
  };

  const resetModal = () => {
    setStep('template');
    setSelectedTemplate(null);
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      icon: '🎯'
    });
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
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'template':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Choose a Goal Template</h3>
              <p className="text-muted-foreground text-sm">Or create a custom goal from scratch</p>
            </div>

            <div className="space-y-3">
              {goalTemplates.map((template, index) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{template.title}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>₹{template.targetAmount.toLocaleString()}</span>
                      <span>•</span>
                      <span>{template.suggestedDuration} days</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCustomGoal}
                className="flex-1 btn-primary"
              >
                Custom Goal
              </Button>
            </div>
          </div>
        );

      case 'custom':
      case 'details':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                placeholder="e.g., Emergency Fund"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this goal for?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field min-h-[80px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="targetAmount">Target Amount (₹)</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="5000"
                value={formData.targetAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                className="input-field"
                required
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                className="input-field"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label>Goal Icon</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {['🎯', '💰', '🏠', '🚗', '📱', '✈️', '🎓', '💍', '🎮', '🏖️', '💻', '🛡️'].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all",
                      formData.icon === icon
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={step === 'details' ? () => setStep('template') : onClose}
                className="flex-1"
              >
                {step === 'details' ? 'Back' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                className="flex-1 btn-primary"
              >
                Create Goal
              </Button>
            </div>
          </form>
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
            className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Create Savings Goal</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onClose();
                  resetModal();
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {renderStep()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}