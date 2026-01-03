interface UserProfileCardProps {
    user: {
        id: string;
        username: string;
        name: string | null;
        email: string;
        image?: string | null;
        createdAt: string;
        bio?: string | null;
        location?: string | null;
        website?: string | null;
        timezone?: string;
        locale?: string;
    };
    onUpdateUsername?: (newUsername: string) => Promise<void>;
    onUpdateProfile?: (data: Partial<UserProfileCardProps['user']>) => Promise<void>;
    showEditButton?: boolean;
    className?: string;
    variant?: 'default' | 'compact' | 'minimal';
    usernameValidation?: {
        isLoading: boolean;
        isValid: boolean;
        isAvailable?: boolean;
        message?: string;
    };
    onValidateUsername?: (username: string) => void;
}
export declare function UserProfileCard({ user, onUpdateUsername, onUpdateProfile, showEditButton, className, variant, usernameValidation, onValidateUsername, }: UserProfileCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=user-profile-card.d.ts.map