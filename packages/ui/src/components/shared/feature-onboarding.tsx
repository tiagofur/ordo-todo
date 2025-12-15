"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, CheckCircle2, LucideIcon } from "lucide-react";
import { Button } from "../ui/button.js";
import { cn } from "../../utils/index.js";

export interface OnboardingStep {
  id: string;
  icon: LucideIcon;
  color: string;
  title: string;
  description: string;
}

interface FeatureOnboardingProps {
  steps: OnboardingStep[];
  storageKey: string;
  onComplete?: () => void;
  onSkip?: () => void;
  skipText?: string;
  nextText?: string;
  getStartedText?: string;
}

export function FeatureOnboarding({
  steps,
  storageKey,
  onComplete,
  onSkip,
  skipText = "Skip",
  nextText = "Next",
  getStartedText = "Get Started",
}: FeatureOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const markAsSeen = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "true");
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      setIsExiting(true);
      markAsSeen();
      setTimeout(() => {
        onComplete?.();
      }, 300);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setIsExiting(true);
    markAsSeen();
    setTimeout(() => {
      onSkip?.();
    }, 300);
  };

  if (!step) return null;

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
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
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
                      backgroundColor: index <= currentStep ? step.color : "var(--muted)",
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
                  {skipText}
                </button>

                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 rounded-xl"
                  style={{ backgroundColor: step.color }}
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {getStartedText}
                    </>
                  ) : (
                    <>
                      {nextText}
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

/**
 * Hook to check if onboarding has been seen
 */
export function useOnboardingStatus(storageKey: string): {
  hasSeenOnboarding: boolean;
  markAsSeen: () => void;
  resetOnboarding: () => void;
} {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(storageKey) === "true";
  });

  const markAsSeen = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "true");
      setHasSeenOnboarding(true);
    }
  };

  const resetOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
      setHasSeenOnboarding(false);
    }
  };

  return { hasSeenOnboarding, markAsSeen, resetOnboarding };
}
