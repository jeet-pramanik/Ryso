import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { userRepository } from '@/services/repositories/UserRepository';
import { seedOrchestrator } from '@/data/seedOrchestrator';
import { APP_CONFIG } from '@/constants/app';

interface UserState {
  user: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearUser: () => void;
  initializeUser: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,
      isLoading: false,
      
      setUser: (user: User) => {
        set({ user, isInitialized: true });
      },
      
      updateUser: async (userData: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        try {
          const updatedData = {
            ...userData,
            updatedAt: new Date().toISOString()
          };
          
          await userRepository.update(currentUser.id, updatedData);
          
          set({ 
            user: { 
              ...currentUser, 
              ...updatedData
            } 
          });
        } catch (error) {
          console.error('Failed to update user:', error);
          throw error;
        }
      },
      
      clearUser: () => {
        set({ user: null, isInitialized: false });
      },
      
      initializeUser: async () => {
        try {
          set({ isLoading: true });
          
          // Ensure database is seeded
          await seedOrchestrator.checkAndSeed();
          
          // Try to load user from database
          const user = await userRepository.getById(APP_CONFIG.DEMO_USER_ID);
          
          if (user) {
            set({ user, isInitialized: true, isLoading: false });
          } else {
            // Fallback - should not happen after seeding
            console.warn('User not found after seeding');
            set({ isInitialized: true, isLoading: false });
          }
        } catch (error) {
          console.error('Failed to initialize user:', error);
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'ampp-user-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);