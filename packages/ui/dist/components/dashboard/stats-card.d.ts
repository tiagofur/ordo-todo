import { type ElementType } from 'react';
interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: ElementType;
    iconColor?: string;
    iconBgColor?: string;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    onClick?: () => void;
}
export declare function StatsCard({ title, value, subtitle, icon: Icon, iconColor, iconBgColor, trend, onClick, }: StatsCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=stats-card.d.ts.map