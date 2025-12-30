import { type LucideIcon } from 'lucide-react';
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
export declare function HabitOnboarding({ onComplete, onSkip, labels, steps, }: HabitOnboardingProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=habit-onboarding.d.ts.map