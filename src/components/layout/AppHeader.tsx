import { Bell, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';

interface AppHeaderProps {
  title: string;
  showNotifications?: boolean;
  showSettings?: boolean;
  rightAction?: React.ReactNode;
}

export default function AppHeader({ 
  title, 
  showNotifications = true, 
  showSettings = false, 
  rightAction 
}: AppHeaderProps) {
  const { user } = useUserStore();

  return (
    <motion.header 
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {user && (
            <p className="text-sm text-muted-foreground">
              Welcome back, {user.name.split(' ')[0]}!
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {rightAction}
          
          {showNotifications && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">2</span>
              </div>
            </Button>
          )}
          
          {showSettings && (
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}