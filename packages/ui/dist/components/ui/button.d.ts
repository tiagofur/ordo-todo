import * as React from "react";
import { type VariantProps } from "class-variance-authority";
declare const buttonVariants: (props?: ({
    variant?: "default" | "destructive" | "link" | "outline" | "secondary" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/**
 * Button component with support for multiple variants and sizes.
 * Built on top of Radix Slot for polymorphism.
 *
 * @param className - Additional CSS classes
 * @param variant - Visual style variant (default, destructive, outline, etc.)
 * @param size - Size variant (default, sm, lg, icon)
 * @param asChild - If true, renders the child component while passing props (polymorphism)
 */
declare function Button({ className, variant, size, asChild, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export { Button, buttonVariants };
//# sourceMappingURL=button.d.ts.map