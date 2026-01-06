import { RoadmapItem, RoadmapItemProps, RoadmapStatus } from "../model/roadmap-item.entity";
import { RoadmapVote, RoadmapVoteProps } from "../model/roadmap-vote.entity";

/**
 * Repository interface for Roadmap persistence operations.
 */
export interface IRoadmapRepository {
    // ============ RoadmapItem Operations ============

    /**
     * Find a roadmap item by ID
     */
    findItemById(id: string): Promise<RoadmapItem | null>;

    /**
     * Find all roadmap items with optional filtering
     */
    findAllItems(params?: {
        skip?: number;
        take?: number;
        status?: RoadmapStatus;
    }): Promise<RoadmapItem[]>;

    /**
     * Create a new roadmap item
     */
    createItem(item: RoadmapItem): Promise<RoadmapItem>;

    /**
     * Update a roadmap item
     */
    updateItem(id: string, data: Partial<RoadmapItemProps>): Promise<RoadmapItem>;

    /**
     * Delete a roadmap item
     */
    deleteItem(id: string): Promise<void>;

    // ============ RoadmapVote Operations ============

    /**
     * Find a vote by item and user
     */
    findVote(itemId: string, userId: string): Promise<RoadmapVote | null>;

    /**
     * Create a vote and update item total votes
     */
    createVote(vote: RoadmapVote): Promise<{ vote: RoadmapVote; item: RoadmapItem }>;

    /**
     * Delete a vote and update item total votes
     */
    deleteVote(itemId: string, userId: string): Promise<RoadmapItem>;

    /**
     * Check if user has voted on an item
     */
    hasUserVoted(itemId: string, userId: string): Promise<boolean>;
}
