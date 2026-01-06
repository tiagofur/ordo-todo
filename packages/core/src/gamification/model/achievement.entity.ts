import { Entity, EntityProps } from "../../shared/entity";

/**
 * Props for Achievement entity
 */
export interface AchievementProps extends EntityProps {
    code: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Achievement domain entity
 */
export class Achievement extends Entity<AchievementProps> {
    constructor(props: AchievementProps) {
        super({
            ...props,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    /**
     * Create a new achievement
     */
    static create(
        props: Omit<AchievementProps, "id" | "createdAt" | "updatedAt">
    ): Achievement {
        return new Achievement({
            ...props,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get code(): string {
        return this.props.code;
    }

    get name(): string {
        return this.props.name;
    }

    get description(): string {
        return this.props.description;
    }

    get icon(): string {
        return this.props.icon;
    }

    get xpReward(): number {
        return this.props.xpReward;
    }
}
