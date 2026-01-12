import { motion } from 'framer-motion';
import { PartyPopper, ArrowRight, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompletionCelebrationProps {
  onNextDay: () => void;
  onClose: () => void;
  isLastDay: boolean;
  isToday?: boolean;
}

export function CompletionCelebration({ onNextDay, onClose, isLastDay, isToday = true }: CompletionCelebrationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-md mx-4 p-8 rounded-2xl glass text-center space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
          className="mx-auto w-20 h-20 rounded-full gradient-bg flex items-center justify-center glow"
        >
          {isLastDay ? (
            <Trophy className="h-10 w-10 text-primary-foreground" />
          ) : (
            <PartyPopper className="h-10 w-10 text-primary-foreground" />
          )}
        </motion.div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold gradient-text">
            {isLastDay ? "Week Complete!" : "Day Complete!"}
          </h2>
          <p className="text-muted-foreground">
            {isLastDay
              ? "Amazing work! You've completed all tasks for this week. Your consistency is paying off!"
              : isToday
                ? "Great job! You've completed all tasks for today. Come back tomorrow for new challenges!"
                : "Your next day is ready! Let's keep the momentum going."}
          </p>
        </div>

        {!isLastDay && (
          <Button
            onClick={onNextDay}
            className="gradient-bg hover:opacity-90 transition-opacity gap-2"
            size="lg"
          >
            Start Next Day
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
