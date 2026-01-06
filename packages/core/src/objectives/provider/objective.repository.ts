import { Objective } from "../model/objective.entity";
import { KeyResult } from "../model/key-result.entity";

/**
 * Repository interface for Objective and Key Result persistence operations.
 */
export interface IObjectiveRepository {
    /**
     * Find objective by ID
     */
    findById(id: string): Promise<Objective | null>;

    /**
     * Find many objectives for a user
     */
    findByUserId(userId: string): Promise<Objective[]>;

    /**
     * Find many objectives in a workspace
     */
    findByWorkspaceId(workspaceId: string): Promise<Objective[]>;

    /**
     * Create a new objective
     */
    create(objective: Objective): Promise<Objective>;

    /**
     * Update an objective
     */
    update(objective: Objective): Promise<Objective>;

    /**
     * Delete an objective (and its KRs)
     */
    delete(id: string): Promise<void>;

    /**
     * Find Key Result by ID
     */
    findKeyResultById(id: string): Promise<KeyResult | null>;

    /**
     * Create a Key Result
     */
    createKeyResult(kr: KeyResult): Promise<KeyResult>;

    /**
     * Update a Key Result
     */
    updateKeyResult(kr: KeyResult): Promise<KeyResult>;

    /**
     * Delete a Key Result
     */
    deleteKeyResult(id: string): Promise<void>;

    /**
     * Link a task to a Key Result
     */
    linkTask(krId: string, taskId: string, weight?: number): Promise<void>;

    /**
     * Unlink a task from a Key Result
     */
    unlinkTask(krId: string, taskId: string): Promise<void>;
}
