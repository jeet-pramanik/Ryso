import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, X } from 'lucide-react';
import { Achievement } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.3 }}
        className="fixed bottom-20 left-4 right-4 z-[300]"
      >
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-yellow-400 to-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-full">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">Achievement Unlocked!</h3>
                <p className="text-yellow-100 font-medium">{achievement.title}</p>
                <p className="text-yellow-200 text-sm">{achievement.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementToast;
