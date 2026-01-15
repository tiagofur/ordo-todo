import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';

/**
 * Merge class names utility
 * Combines clsx and removes duplicates
 */
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

/**
 * Button variants configuration
 */
export const buttonVariants = cva(
    // Base styles
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-cyan-500 text-white hover:bg-cyan-600 focus-visible:ring-cyan-500',
                secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus-visible:ring-gray-500',
                ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white',
                danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
                success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
            },
            size: {
                xs: 'h-7 px-2 text-xs rounded',
                sm: 'h-8 px-3 text-sm rounded-md',
                md: 'h-10 px-4 text-sm rounded-lg',
                lg: 'h-12 px-6 text-base rounded-lg',
                xl: 'h-14 px-8 text-lg rounded-xl',
            },
            fullWidth: {
                true: 'w-full',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            fullWidth: false,
        },
    }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

/**
 * Input variants configuration
 */
export const inputVariants = cva(
    // Base styles
    'w-full bg-gray-900 border transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            size: {
                sm: 'h-8 px-3 text-sm rounded-md',
                md: 'h-10 px-4 text-sm rounded-lg',
                lg: 'h-12 px-4 text-base rounded-lg',
            },
            error: {
                true: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                false: 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/20',
            },
        },
        defaultVariants: {
            size: 'md',
            error: false,
        },
    }
);

export type InputVariants = VariantProps<typeof inputVariants>;

/**
 * Card variants configuration
 */
export const cardVariants = cva(
    // Base styles
    'rounded-xl transition-all',
    {
        variants: {
            variant: {
                default: 'bg-gray-900 border border-gray-800',
                outlined: 'bg-transparent border-2 border-gray-700',
                elevated: 'bg-gray-900 shadow-lg shadow-black/20',
                glass: 'bg-gray-900/50 backdrop-blur-md border border-gray-800/50',
            },
            padding: {
                none: 'p-0',
                sm: 'p-3',
                md: 'p-4',
                lg: 'p-6',
            },
            clickable: {
                true: 'cursor-pointer hover:border-gray-600 active:scale-[0.99]',
                false: '',
            },
            selected: {
                true: 'border-cyan-500 ring-2 ring-cyan-500/20',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            padding: 'md',
            clickable: false,
            selected: false,
        },
    }
);

export type CardVariants = VariantProps<typeof cardVariants>;

/**
 * Badge variants configuration
 */
export const badgeVariants = cva(
    // Base styles
    'inline-flex items-center font-medium',
    {
        variants: {
            variant: {
                default: 'bg-gray-700 text-gray-300',
                primary: 'bg-cyan-500/20 text-cyan-400',
                secondary: 'bg-purple-500/20 text-purple-400',
                success: 'bg-green-500/20 text-green-400',
                warning: 'bg-yellow-500/20 text-yellow-400',
                danger: 'bg-red-500/20 text-red-400',
            },
            size: {
                sm: 'px-2 py-0.5 text-xs rounded',
                md: 'px-2.5 py-1 text-sm rounded-md',
                lg: 'px-3 py-1.5 text-base rounded-lg',
            },
            pill: {
                true: 'rounded-full',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'sm',
            pill: false,
        },
    }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

/**
 * Text variants configuration
 */
export const textVariants = cva('', {
    variants: {
        variant: {
            h1: 'text-4xl font-bold tracking-tight',
            h2: 'text-3xl font-bold tracking-tight',
            h3: 'text-2xl font-semibold',
            h4: 'text-xl font-semibold',
            h5: 'text-lg font-medium',
            h6: 'text-base font-medium',
            body: 'text-sm',
            caption: 'text-xs',
            label: 'text-sm font-medium',
        },
        color: {
            default: 'text-gray-100',
            muted: 'text-gray-400',
            primary: 'text-cyan-400',
            danger: 'text-red-400',
            success: 'text-green-400',
        },
        weight: {
            normal: 'font-normal',
            medium: 'font-medium',
            semibold: 'font-semibold',
            bold: 'font-bold',
        },
        align: {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right',
        },
        truncate: {
            true: 'truncate',
            false: '',
        },
    },
    defaultVariants: {
        variant: 'body',
        color: 'default',
        weight: 'normal',
        align: 'left',
        truncate: false,
    },
});

export type TextVariants = VariantProps<typeof textVariants>;

// Re-export CVA utilities
export { cva, type VariantProps } from 'class-variance-authority';
export { clsx, type ClassValue } from 'clsx';
