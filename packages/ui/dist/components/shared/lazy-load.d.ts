export declare function LazyLoad<T extends React.ComponentType<any>>(factory: () => Promise<{
    default: T;
}>, fallback?: React.ReactNode): {
    (props: React.ComponentProps<T>): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare function preloadComponent(factory: () => Promise<{
    default: any;
}>): void;
//# sourceMappingURL=lazy-load.d.ts.map