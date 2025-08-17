import { Bell, Settings, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      className="sticky top-0 z-40 px-4 py-3"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md mx-auto">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {/* App Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
                <Target className="h-5 w-5 text-white" />
              </div>
              
              <div>
                <h1 className="text-lg font-bold text-foreground">{title}</h1>
                {user && (
                  <p className="text-xs text-muted-foreground">
                    Welcome back, {user.name.split(' ')[0]}! 👋
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {rightAction}
              
              {showNotifications && (
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
                  <Bell className="h-4 w-4" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-[10px] text-white font-bold">2</span>
                  </div>
                </Button>
              )}
              
              {showSettings && (
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.header>
  );
}