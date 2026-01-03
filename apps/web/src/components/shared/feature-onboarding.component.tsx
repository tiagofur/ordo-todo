"use client";

import { useState, useEffect } from "react";
import { FeatureOnboarding as FeatureOnboardingUI, type OnboardingStep } from "@ordo-todo/ui";

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
    getStartedText
}: FeatureOnboardingProps) {
    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0);

    // Initial check
    useEffect(() => {
        const seen = localStorage.getItem(storageKey);
        if (!seen) setShow(true);
    }, [storageKey]);

    const handleComplete = () => {
        localStorage.setItem(storageKey, "true");
        setShow(false);
        onComplete?.();
    };

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(s => s + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        localStorage.setItem(storageKey, "true");
        setShow(false);
        onSkip?.();
    }

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
    )
}
