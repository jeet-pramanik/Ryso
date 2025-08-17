import { SavingsGoal, GoalStatus, GoalCategory } from '@/types';

export const generateSampleGoals = (userId: string): SavingsGoal[] => {
  const now = new Date();
  const goals: SavingsGoal[] = [
    {
      id: 'goal-1',
      userId,
      title: 'Emergency Fund',
      description: 'Building a safety net for unexpected expenses',
      targetAmount: 50000,
      currentAmount: 12500,
      targetDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
      category: GoalCategory.EMERGENCY,
      status: GoalStatus.ACTIVE,
      icon: 'Heart',
      color: '#ef4444',
      milestones: [
        {
          id: 'milestone-1',
          amount: 10000,
          date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          isCompleted: true
        },
        {
          id: 'milestone-2',
          amount: 25000,
          date: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          isCompleted: false
        },
        {
          id: 'milestone-3',
          amount: 50000,
          date: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          isCompleted: false
        }
      ],
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'goal-2',
      userId,
      title: 'New MacBook Pro',
      description: 'Saving for a new laptop for college',
      targetAmount: 120000,
      currentAmount: 35000,
      targetDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 4 months
      category: GoalCategory.GADGET,
      status: GoalStatus.ACTIVE,
      icon: 'Smartphone',
      color: '#a855f7',
      milestones: [
        {
          id: 'milestone-4',
          amount: 30000,
          date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isCompleted: true
        },
        {
          id: 'milestone-5',
          amount: 60000,
          date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          isCompleted: false
        },
        {
          id: 'milestone-6',
          amount: 120000,
          date: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          isCompleted: false
        }
      ],
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'goal-3',
      userId,
      title: 'Goa Trip',
      description: 'Summer vacation with friends',
      targetAmount: 25000,
      currentAmount: 8500,
      targetDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months
      category: GoalCategory.TRAVEL,
      status: GoalStatus.ACTIVE,
      icon: 'Plane',
      color: '#3b82f6',
      milestones: [
        {
          id: 'milestone-7',
          amount: 8000,
          date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isCompleted: true
        },
        {
          id: 'milestone-8',
          amount: 15000,
          date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          isCompleted: false
        },
        {
          id: 'milestone-9',
          amount: 25000,
          date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          isCompleted: false
        }
      ],
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return goals;
};
