export interface UsernameInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    label?: string;
    id?: string;
    error?: string;
    helperText?: string;
    isLoading?: boolean;
    isValid?: boolean;
    isAvailable?: boolean | null;
    validationMessage?: string;
    suggestions?: string[];
    showSuggestions?: boolean;
    onSuggestionClick?: (suggestion: string) => void;
    onRefreshSuggestions?: () => void;
}
export declare function UsernameInput({ value, onChange, onBlur, placeholder, disabled, required, className, label, id, error: externalError, helperText, isLoading, isValid, isAvailable, validationMessage, suggestions, showSuggestions, onSuggestionClick, onRefreshSuggestions, }: UsernameInputProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=username-input.d.ts.map