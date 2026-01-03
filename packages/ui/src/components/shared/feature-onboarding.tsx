import { ArrowRight, X, CheckCircle2 } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { Button } from "../ui/button.js";
import { cn } from "../../utils/index.js";

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

export function FeatureOnboarding({
  steps,
  isOpen,
  currentStep,
  onNext,
  onSkip,
  skipText = "Skip",
  nextText = "Next",
  getStartedText = "Get Started",
}: FeatureOnboardingProps) {
  
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  if (!isOpen || !step) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 slide-in-from-bottom-10"
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            {/* Icon with background */}
            <div className="relative mb-6 animate-in zoom-in delay-150 duration-500">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-30"
                style={{ backgroundColor: step.color }}
              />
              <div
                className="relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-500 hover:scale-105"
                style={{
                  backgroundColor: step.color,
                  boxShadow: `0 20px 40px -10px ${step.color}60`,
                }}
              >
                <step.icon className="h-12 w-12" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-3 animate-in slide-in-from-bottom-2 fade-in delay-200 duration-500">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground max-w-sm animate-in slide-in-from-bottom-2 fade-in delay-300 duration-500">
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentStep ? "w-6" : "w-2"
                )}
                style={{
                    backgroundColor: index <= currentStep ? step.color : "var(--muted)",
                    opacity: index <= currentStep ? 1 : 0.3
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 animate-in slide-in-from-bottom-4 fade-in delay-500 duration-500">
            <button
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {skipText}
            </button>

            <Button
              onClick={onNext}
              className="flex items-center gap-2 px-6 rounded-xl transition-all hover:scale-105 active:scale-95"
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
          </div>
        </div>
      </div>
    </div>
  );
}
