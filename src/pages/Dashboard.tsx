import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { DayHeader } from '@/components/DayHeader';
import { DayProgress } from '@/components/DayProgress';
import { TaskCard } from '@/components/TaskCard';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTasks } from '@/hooks/useTasks';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { useParams } from 'react-router-dom';

export default function Dashboard() {
  const { slug } = useParams();
  const {
    weeklyPlan,
    userProgress,
    currentDay,
    completedTasks,
    loading,
    toggleTaskCompletion,
    isTaskCompleted,
    allTasksCompleted,
    advanceToNextDay,
    isAuthenticated,
    isToday,
    canAdvance,
    isCurrentDayLocked,
  } = useTasks(slug);

  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);

  // Keep selected day in sync with active progress
  useEffect(() => {
    if (userProgress) {
      setSelectedDayNum(userProgress.current_day);
    } else if (!isAuthenticated && weeklyPlan && !selectedDayNum) {
      setSelectedDayNum(1);
    }
  }, [userProgress?.current_day, weeklyPlan, isAuthenticated]);

  const activeDayNum = userProgress?.current_day || 1;
  const viewedDay = weeklyPlan?.days_data?.days?.find(d => d.day === (selectedDayNum || activeDayNum)) || currentDay;

  useEffect(() => {
    // Only show celebration automatically if completed TODAY
    if (allTasksCompleted && !hasShownCelebration && currentDay && isToday) {
      setShowCelebration(true);
      setHasShownCelebration(true);
    }
  }, [allTasksCompleted, hasShownCelebration, currentDay, isToday]);

  // Reset celebration state when day changes
  useEffect(() => {
    setHasShownCelebration(false);
    setShowCelebration(false);
  }, [userProgress?.current_day]);

  const handleNextDay = async () => {
    if (!canAdvance) {
      toast.info("Building consistency takes time! Please come back tomorrow for Day " + (activeDayNum + 1));
      return;
    }
    const promise = advanceToNextDay();
    toast.promise(promise, {
      loading: 'Unlocking next day...',
      success: 'Day unlocked! Good luck.',
      error: 'Failed to advance day. Please try again.',
    });

    const success = await promise;
    if (success) {
      setShowCelebration(false);
      setSelectedDayNum(activeDayNum + 1);
    }
  };

  const handleReadOnlyClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to access todo flow");
    } else if (isCurrentDayLocked && (selectedDayNum === activeDayNum)) {
      toast.info("You've already made great progress today! Day " + activeDayNum + " will unlock tomorrow.");
    } else if (selectedDayNum && selectedDayNum > activeDayNum) {
      if (allTasksCompleted) {
        if (isToday) {
          toast.info("Great job! You've finished today. Come back tomorrow for the next day!");
        } else {
          setShowCelebration(true);
        }
      } else {
        toast.info(`Complete Day ${activeDayNum} first to start this task`);
      }
    } else if (selectedDayNum && selectedDayNum < activeDayNum) {
      toast.info("This day is already completed");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!weeklyPlan || !viewedDay) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold font-display">No Plan Found</h2>
            <p className="text-muted-foreground">
              We couldn't find a plan for this category.
            </p>
            <Button onClick={() => window.location.href = '/categories'}>
              Browse Categories
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tasks = viewedDay.tasks || [];
  const totalTime = tasks.reduce((acc, task) => acc + (task.estimated_time_min || 0), 0);
  const isLastDay = (userProgress?.current_day || 1) >= weeklyPlan.days_data.days.length;
  const isViewingCurrentDay = isAuthenticated && (selectedDayNum === (userProgress?.current_day || 1));
  const showNextDayAction = allTasksCompleted && !isLastDay && isViewingCurrentDay;
  const isLocked = isCurrentDayLocked && isViewingCurrentDay;

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <Header />

      <main className="container relative z-10 py-8 pb-20">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Day header */}
          <DayHeader day={viewedDay} theme={weeklyPlan.theme} />

          {/* Locked State Warning */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-secondary/30 border border-border text-center space-y-2"
            >
              <h3 className="text-lg font-bold">Day {activeDayNum} is Locked 🔒</h3>
              <p className="text-sm text-muted-foreground">
                You've already completed a day today. Building a creator habit takes patience. Come back tomorrow!
              </p>
            </motion.div>
          )}

          {/* Next Day Action Card */}
          {showNextDayAction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-2xl border text-center space-y-4 ${canAdvance
                ? "bg-primary/10 border-primary/20"
                : "bg-secondary/50 border-border opacity-80"
                }`}
            >
              <h3 className="text-lg font-bold">
                {canAdvance ? "Your next day is ready! 🚀" : "Day Complete! Proper rest is key 🧘"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {canAdvance
                  ? `You finished Day ${activeDayNum} yesterday. Ready to level up?`
                  : "Consistency is about daily practice, not speed. Come back tomorrow for Day " + (activeDayNum + 1)}
              </p>
              <Button
                onClick={handleNextDay}
                className={`w-full ${canAdvance ? "gradient-bg" : "bg-secondary text-secondary-foreground"}`}
                disabled={!canAdvance}
              >
                {canAdvance ? `Start Day ${activeDayNum + 1}` : "Wait for Tomorrow"}
              </Button>
            </motion.div>
          )}

          {/* Progress section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <DayProgress
              currentDay={userProgress?.current_day || 1}
              totalDays={weeklyPlan.days_data.days.length}
              completedTasks={completedTasks.filter(t => t.day_number === (selectedDayNum || activeDayNum)).length}
              totalTasks={tasks.length}
              onDaySelect={setSelectedDayNum}
              selectedDay={selectedDayNum || activeDayNum}
            />
          </motion.div>

          {/* Time estimate */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-muted-foreground"
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm">Estimated time: ~{totalTime} minutes</span>
          </motion.div>

          {/* Tasks list */}
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={isTaskCompleted(task.id, selectedDayNum || activeDayNum)}
                onToggle={() => toggleTaskCompletion(task.id)}
                index={index}
                readOnly={!isViewingCurrentDay || isLocked}
                isAuthenticated={isAuthenticated}
                onClickReadOnly={handleReadOnlyClick}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Celebration modal */}
      <AnimatePresence>
        {showCelebration && (
          <CompletionCelebration
            onNextDay={handleNextDay}
            onClose={() => setShowCelebration(false)}
            isLastDay={isLastDay}
            isToday={isToday}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
