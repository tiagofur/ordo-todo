"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FeatureOnboarding as FeatureOnboardingUI,
  type OnboardingStep,
} from "@ordo-todo/ui";
import { useOnboardingStore } from "@/stores/onboarding-store";

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
  skipText,
  nextText,
  getStartedText,
}: FeatureOnboardingProps) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const activeTours = useOnboardingStore((s) => s.active);
  const acquiredRef = useRef(false);
  const ownerId = `page:${storageKey}`;

  // Muestra el tour solo si no se ha visto y el turno del onboarding está
  // libre (mutex compartida con el tour de IA); si está ocupado, reintenta
  // cuando se libera.
  useEffect(() => {
    if (localStorage.getItem(storageKey)) return;
    if (acquiredRef.current) return;
    if (
      activeTours.length === 0 &&
      useOnboardingStore.getState().tryAcquire(ownerId)
    ) {
      acquiredRef.current = true;
      setShow(true);
    }
  }, [storageKey, ownerId, activeTours]);

  const release = useCallback(() => {
    if (acquiredRef.current) {
      useOnboardingStore.getState().release(ownerId);
      acquiredRef.current = false;
    }
  }, [ownerId]);

  // Libera el turno si la página se desmonta con el tour abierto
  useEffect(() => () => release(), [release]);

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    release();
    setShow(false);
    onComplete?.();
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, "true");
    release();
    setShow(false);
    onSkip?.();
  };

  if (!show) return null;

  return (
    <FeatureOnboardingUI
      isOpen={show}
      steps={steps}
      currentStep={step}
      onNext={handleNext}
      onSkip={handleSkip}
      onClose={handleComplete}
      skipText={skipText}
      nextText={nextText}
      getStartedText={getStartedText}
    />
  );
}
