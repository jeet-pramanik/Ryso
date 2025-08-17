import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface UserState {
  user: User | null;
  isInitialized: boolean;
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  clearUser: () => void;
  initializeUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,
      
      setUser: (user: User) => {
        set({ user, isInitialized: true });
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { 
              ...currentUser, 
              ...userData, 
              updatedAt: new Date().toISOString() 
            } 
          });
        }
      },
      
      clearUser: () => {
        set({ user: null, isInitialized: false });
      },
      
      initializeUser: () => {
        const currentUser = get().user;
        if (!currentUser) {
          // Create demo user
          const demoUser: User = {
            id: 'demo-user-1',
            name: 'Arjun Sharma',
            email: 'arjun.sharma@college.edu',
            phone: '+91 98765 43210',
            monthlyBudget: 8000,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          set({ user: demoUser, isInitialized: true });
        } else {
          set({ isInitialized: true });
        }
      }
    }),
    {
      name: 'ampp-user-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);