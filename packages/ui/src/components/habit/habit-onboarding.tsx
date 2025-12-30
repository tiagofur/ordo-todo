'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Target,
  Flame,
  Bell,
  Zap,
  ArrowRight,
  X,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '../ui/button.js';
import { cn } from '../../utils/index.js';

interface OnboardingStep {
  id: string;
  icon: LucideIcon;
  color: string;
  title: string;
  description: string;
}

interface HabitOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  labels?: {
    skip?: string;
    next?: string;
    getStarted?: string;
  };
  steps?: OnboardingStep[];
}

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: Sparkles,
    color: '#10B981',
    title: 'Welcome to Habits',
    description: 'Start building positive routines that stick.',
  },
  {
    id: 'streaks',
    icon: Flame,
    color: '#f59e0b',
    title: 'Build Streaks',
    description: 'Keep your momentum going by completing habits daily.',
  },
  {
    id: 'reminders',
    icon: Bell,
    color: '#8b5cf6',
    title: 'Smart Reminders',
    description: 'Get notified at the perfect time to perform your habits.',
  },
  {
    id: 'gamification',
    icon: Zap,
    color: '#06b6d4',
    title: 'Level Up',
    description: 'Earn XP and rewards as you complete your goals.',
  },
];

export function HabitOnboarding({
  onComplete,
  onSkip,
  labels = {},
  steps = DEFAULT_STEPS,
}: HabitOnboardingProps) {
  const {
    skip = 'Skip',
    next = 'Next',
    getStarted = 'Get Started',
  } = labels;

  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Safety check if steps array is empty
  if (!step) return null;

  const handleNext = () => {
    if (isLastStep) {
      setIsExiting(true);
      setTimeout(onComplete, 300);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(onSkip, 300);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon with animated background */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                    className="relative mb-6"
                  >
                    <div
                      className="absolute inset-0 rounded-full blur-2xl opacity-30"
                      style={{ backgroundColor: step.color }}
                    />
                    <div
                      className="relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg"
                      style={{
                        backgroundColor: step.color,
                        boxShadow: `0 20px 40px -10px ${step.color}60`,
                      }}
                    >
                      <step.icon className="h-12 w-12" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold mb-3"
                  >
                    {step.title}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground max-w-sm"
                  >
                    {step.description}
                  </motion.p>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={false}
                    animate={{
                      width: index === currentStep ? 24 : 8,
                      backgroundColor:
                        index <= currentStep ? step.color : 'var(--muted)',
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2 rounded-full"
                  />
                ))}
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between mt-8"
              >
                <button
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {skip}
                </button>

                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 rounded-xl"
                  style={{ backgroundColor: step.color }}
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {getStarted}
                    </>
                  ) : (
                    <>
                      {next}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
