import { LucideIcon } from "lucide-react";
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
export declare function FeatureOnboarding({ steps, storageKey, onComplete, onSkip, skipText, nextText, getStartedText, }: FeatureOnboardingProps): import("react/jsx-runtime").JSX.Element | null;
/**
 * Hook to check if onboarding has been seen
 */
export declare function useOnboardingStatus(storageKey: string): {
    hasSeenOnboarding: boolean;
    markAsSeen: () => void;
    resetOnboarding: () => void;
};
export {};
//# sourceMappingURL=feature-onboarding.d.ts.map