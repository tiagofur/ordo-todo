import { type ReactNode } from 'react';
interface AuthFormProps {
    /** Logo component to render */
    renderLogo?: () => ReactNode;
    /** Theme toggle component */
    renderThemeToggle?: () => ReactNode;
    isLoading?: boolean;
    onGoogleSignIn?: () => void;
    onGitHubSignIn?: () => void;
    onEmailLoginClick?: () => void;
    onRegisterClick?: () => void;
    labels?: {
        welcome?: string;
        subtitle?: string;
        emailLogin?: string;
        or?: string;
        googleLogin?: string;
        githubLogin?: string;
        noAccount?: string;
        register?: string;
        connecting?: string;
    };
}
export declare function AuthForm({ renderLogo, renderThemeToggle, isLoading, onGoogleSignIn, onGitHubSignIn, onEmailLoginClick, onRegisterClick, labels, }: AuthFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=auth-form.d.ts.map