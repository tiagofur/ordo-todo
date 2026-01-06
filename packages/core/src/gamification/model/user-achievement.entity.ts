import { Entity, EntityProps } from "../../shared/entity";

/**
 * Props for UserAchievement entity
 */
export interface UserAchievementProps extends EntityProps {
    userId: string;
    achievementId: string;
    unlockedAt?: Date;
}

/**
 * UserAchievement domain entity
 */
export class UserAchievement extends Entity<UserAchievementProps> {
    constructor(props: UserAchievementProps) {
        super({
            ...props,
            unlockedAt: props.unlockedAt ?? new Date(),
        });
    }

    /**
     * Create/Unlock an achievement for a user
     */
    static create(
        props: Omit<UserAchievementProps, "id" | "unlockedAt">
    ): UserAchievement {
        return new UserAchievement({
            ...props,
            unlockedAt: new Date(),
        });
    }

    get userId(): string {
        return this.props.userId;
    }

    get achievementId(): string {
        return this.props.achievementId;
    }

    get unlockedAt(): Date {
        return this.props.unlockedAt!;
    }
}
