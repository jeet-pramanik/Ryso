import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface GlobalLoadingProps {
  message?: string;
}

export default function GlobalLoading({ message = 'Loading...' }: GlobalLoadingProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Ryso</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        
        <div className="flex justify-center">
          <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ x: [-128, 128] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "linear"
              }}
              style={{ width: '50%' }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
