/**
 * HashService interface for password hashing and comparison.
 * This is a port (interface) that should be implemented by infrastructure layer.
 */
export interface HashService {
    /**
     * Hash a plain text value (e.g., password or token)
     */
    hash(value: string): Promise<string>;

    /**
     * Compare a plain text value against a hash
     */
    compare(value: string, hash: string): Promise<boolean>;
}
