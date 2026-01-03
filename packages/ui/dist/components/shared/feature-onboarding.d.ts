import { type LucideIcon } from "lucide-react";
export interface OnboardingStep {
    id: string;
    icon: LucideIcon;
    color: string;
    title: string;
    description: string;
}
export interface FeatureOnboardingProps {
    steps: OnboardingStep[];
    isOpen: boolean;
    currentStep: number;
    onNext: () => void;
    onSkip: () => void;
    onClose?: () => void;
    skipText?: string;
    nextText?: string;
    getStartedText?: string;
}
export declare function FeatureOnboarding({ steps, isOpen, currentStep, onNext, onSkip, skipText, nextText, getStartedText, }: FeatureOnboardingProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=feature-onboarding.d.ts.map