import type { ApiClient } from '@ordo-todo/hooks';
interface UsernameInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    apiClient: ApiClient;
    showSuggestions?: boolean;
    className?: string;
    label?: string;
    id?: string;
    error?: string;
    helperText?: string;
}
export declare function UsernameInput({ value, onChange, onBlur, placeholder, disabled, required, apiClient, showSuggestions, className, label, id, error: externalError, helperText, }: UsernameInputProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=username-input.d.ts.map