import { Entity, EntityProps } from "../../shared/entity";

/**
 * Props for RoadmapVote entity
 */
export interface RoadmapVoteProps extends EntityProps {
    itemId: string;
    userId: string;
    weight: number;
    createdAt?: Date;
}

/**
 * RoadmapVote domain entity
 * 
 * Represents a user's vote on a roadmap item.
 * Weight is determined by subscription tier.
 */
export class RoadmapVote extends Entity<RoadmapVoteProps> {
    constructor(props: RoadmapVoteProps) {
        super({
            ...props,
            weight: props.weight ?? 1,
            createdAt: props.createdAt ?? new Date(),
        });
    }

    /**
     * Create a new roadmap vote
     */
    static create(
        props: Omit<RoadmapVoteProps, "id" | "createdAt">
    ): RoadmapVote {
        return new RoadmapVote({
            ...props,
            createdAt: new Date(),
        });
    }

    get itemId(): string {
        return this.props.itemId;
    }

    get userId(): string {
        return this.props.userId;
    }

    get weight(): number {
        return this.props.weight;
    }

    get createdAt(): Date {
        return this.props.createdAt!;
    }
}

/**
 * Calculate vote weight based on subscription plan
 */
export function calculateVoteWeight(plan?: string): number {
    switch (plan) {
        case "PRO":
            return 3;
        case "TEAM":
            return 5;
        case "ENTERPRISE":
            return 10;
        default:
            return 1;
    }
}
