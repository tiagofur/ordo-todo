import { Entity, EntityProps } from "../../shared/entity";
import { KeyResult } from "./key-result.entity";

export type OKRPeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'PERSONAL';
export type ObjectiveStatus = 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

/**
 * Props for Objective entity
 */
export interface ObjectiveProps extends EntityProps {
    title: string;
    description?: string;
    userId: string;
    workspaceId?: string;
    startDate: Date;
    endDate: Date;
    period: OKRPeriod;
    status: ObjectiveStatus;
    progress: number;
    color: string;
    icon?: string;
    keyResults?: KeyResult[];
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Objective domain entity (OKRs)
 */
export class Objective extends Entity<ObjectiveProps> {
    constructor(props: ObjectiveProps) {
        super({
            ...props,
            status: props.status ?? 'ACTIVE',
            progress: props.progress ?? 0,
            color: props.color ?? '#3B82F6',
            startDate: props.startDate ?? new Date(),
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
            keyResults: props.keyResults ?? [],
        });
    }

    /**
     * Create a new objective
     */
    static create(
        props: Omit<ObjectiveProps, "id" | "createdAt" | "updatedAt" | "progress" | "status" | "keyResults">
    ): Objective {
        return new Objective({
            ...props,
            status: 'ACTIVE',
            progress: 0,
            keyResults: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get title(): string {
        return this.props.title;
    }

    get userId(): string {
        return this.props.userId;
    }

    get progress(): number {
        return this.props.progress;
    }

    /**
     * Calculate total progress based on Key Results
     */
    calculateProgress(): number {
        if (!this.props.keyResults || this.props.keyResults.length === 0) {
            return 0;
        }

        const totalProgress = this.props.keyResults.reduce((sum, kr) => sum + kr.progress, 0);
        return totalProgress / this.props.keyResults.length;
    }

    /**
     * Update progress
     */
    updateProgress(): Objective {
        const newProgress = this.calculateProgress();
        return this.clone({
            progress: newProgress,
            updatedAt: new Date(),
        });
    }
}
