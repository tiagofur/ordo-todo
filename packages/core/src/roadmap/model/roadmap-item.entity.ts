import { Entity, EntityProps } from "../../shared/entity";

/**
 * Status of a roadmap item
 */
export type RoadmapStatus =
    | "CONSIDERING"
    | "PLANNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "DECLINED";

/**
 * Props for RoadmapItem entity
 */
export interface RoadmapItemProps extends EntityProps {
    title: string;
    description: string;
    status: RoadmapStatus;
    totalVotes: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * RoadmapItem domain entity
 * 
 * Represents a feature request or improvement on the roadmap.
 */
export class RoadmapItem extends Entity<RoadmapItemProps> {
    constructor(props: RoadmapItemProps) {
        super({
            ...props,
            status: props.status ?? "CONSIDERING",
            totalVotes: props.totalVotes ?? 0,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    /**
     * Create a new roadmap item
     */
    static create(
        props: Omit<RoadmapItemProps, "id" | "createdAt" | "updatedAt" | "status" | "totalVotes">
    ): RoadmapItem {
        return new RoadmapItem({
            ...props,
            status: "CONSIDERING",
            totalVotes: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get title(): string {
        return this.props.title;
    }

    get description(): string {
        return this.props.description;
    }

    get status(): RoadmapStatus {
        return this.props.status;
    }

    get totalVotes(): number {
        return this.props.totalVotes;
    }

    get createdAt(): Date {
        return this.props.createdAt!;
    }

    get updatedAt(): Date {
        return this.props.updatedAt!;
    }

    /**
     * Check if item is being considered
     */
    isConsidering(): boolean {
        return this.props.status === "CONSIDERING";
    }

    /**
     * Check if item is planned
     */
    isPlanned(): boolean {
        return this.props.status === "PLANNED";
    }

    /**
     * Check if item is in progress
     */
    isInProgress(): boolean {
        return this.props.status === "IN_PROGRESS";
    }

    /**
     * Check if item is completed
     */
    isCompleted(): boolean {
        return this.props.status === "COMPLETED";
    }

    /**
     * Update status
     */
    updateStatus(status: RoadmapStatus): RoadmapItem {
        return this.clone({
            status,
            updatedAt: new Date(),
        });
    }

    /**
     * Increment votes
     */
    incrementVotes(weight: number): RoadmapItem {
        return this.clone({
            totalVotes: this.props.totalVotes + weight,
            updatedAt: new Date(),
        });
    }

    /**
     * Decrement votes
     */
    decrementVotes(weight: number): RoadmapItem {
        return this.clone({
            totalVotes: Math.max(0, this.props.totalVotes - weight),
            updatedAt: new Date(),
        });
    }
}
