import type { ApiClient } from './types';
interface UsernameValidationResult {
    isValid: boolean;
    isAvailable: boolean | null;
    message: string;
    isLoading: boolean;
}
interface UseUsernameValidationOptions {
    apiClient: ApiClient;
    minLength?: number;
    maxLength?: number;
    debounceMs?: number;
    /** Current user's username - if provided, this username is always considered "available" */
    currentUsername?: string;
}
export declare function useUsernameValidation({ apiClient, minLength, maxLength, debounceMs, currentUsername, }: UseUsernameValidationOptions): {
    validationResult: UsernameValidationResult;
    validateUsername: (username: string) => Promise<void>;
    resetValidation: () => void;
};
export declare function generateUsernameSuggestions(baseName: string): string[];
export {};
//# sourceMappingURL=use-username-validation.d.ts.map