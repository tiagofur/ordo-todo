import { Entity, EntityProps } from "../../shared/entity";

export type MetricType = 'NUMBER' | 'PERCENTAGE' | 'CURRENCY' | 'BOOLEAN';

/**
 * Props for KeyResult entity
 */
export interface KeyResultProps extends EntityProps {
    objectiveId: string;
    title: string;
    description?: string;
    metricType: MetricType;
    startValue: number;
    targetValue: number;
    currentValue: number;
    unit?: string;
    progress: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * KeyResult domain entity
 */
export class KeyResult extends Entity<KeyResultProps> {
    constructor(props: KeyResultProps) {
        super({
            ...props,
            progress: props.progress ?? 0,
            startValue: props.startValue ?? 0,
            currentValue: props.currentValue ?? props.startValue ?? 0,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    /**
     * Create a new key result
     */
    static create(
        props: Omit<KeyResultProps, "id" | "createdAt" | "updatedAt" | "progress">
    ): KeyResult {
        const kr = new KeyResult({
            ...props,
            progress: 0,
        });
        return kr.updateProgress(props.currentValue);
    }

    get progress(): number {
        return this.props.progress;
    }

    /**
     * Update current value and recalculate progress
     */
    updateProgress(currentValue: number): KeyResult {
        const { startValue, targetValue } = this.props;
        let progress = 0;

        if (targetValue !== startValue) {
            // (Current - Start) / (Target - Start)
            progress = Math.max(0, Math.min(100, ((currentValue - startValue) / (targetValue - startValue)) * 100));
        } else {
            progress = currentValue >= targetValue ? 100 : 0;
        }

        return this.clone({
            currentValue,
            progress,
            updatedAt: new Date(),
        });
    }
}
