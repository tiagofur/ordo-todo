import type { ReactNode, ChangeEvent } from 'react';
import type { StyleableProps } from './button';

/**
 * Base input props
 */
export interface BaseInputProps extends StyleableProps {
    /** Input name */
    name?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Read-only state */
    readOnly?: boolean;
    /** Required field */
    required?: boolean;
    /** Error state */
    error?: boolean;
    /** Error message */
    errorMessage?: string;
    /** Helper text */
    helperText?: string;
    /** Label text */
    label?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Text input props
 */
export interface InputProps extends BaseInputProps {
    /** Input type */
    type?: 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' | 'number';
    /** Current value */
    value?: string;
    /** Default value (uncontrolled) */
    defaultValue?: string;
    /** Web: onChange handler */
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    /** Mobile: onChangeText handler */
    onChangeText?: (text: string) => void;
    /** On blur handler */
    onBlur?: () => void;
    /** On focus handler */
    onFocus?: () => void;
    /** Icon on the left */
    iconLeft?: ReactNode;
    /** Icon on the right */
    iconRight?: ReactNode;
    /** Maximum length */
    maxLength?: number;
    /** Auto-capitalize (mobile) */
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    /** Auto-complete type */
    autoComplete?: string;
}

/**
 * Textarea props
 */
export interface TextareaProps extends BaseInputProps {
    /** Current value */
    value?: string;
    /** Default value */
    defaultValue?: string;
    /** Web: onChange handler */
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    /** Mobile: onChangeText handler */
    onChangeText?: (text: string) => void;
    /** Number of visible rows */
    rows?: number;
    /** Maximum length */
    maxLength?: number;
    /** Auto-resize to content */
    autoResize?: boolean;
}

/**
 * Select/Dropdown props
 */
export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface SelectProps extends BaseInputProps {
    /** Available options */
    options: SelectOption[];
    /** Current value */
    value?: string;
    /** Default value */
    defaultValue?: string;
    /** Change handler */
    onChange?: (value: string) => void;
    /** Searchable select */
    searchable?: boolean;
    /** Multi-select */
    multiple?: boolean;
}

/**
 * Checkbox props
 */
export interface CheckboxProps extends StyleableProps {
    /** Checked state */
    checked?: boolean;
    /** Default checked (uncontrolled) */
    defaultChecked?: boolean;
    /** Change handler */
    onChange?: (checked: boolean) => void;
    /** Label text */
    label?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Indeterminate state */
    indeterminate?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Switch/Toggle props
 */
export interface SwitchProps extends StyleableProps {
    /** Checked state */
    checked?: boolean;
    /** Default checked */
    defaultChecked?: boolean;
    /** Change handler */
    onChange?: (checked: boolean) => void;
    /** Label text */
    label?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}
