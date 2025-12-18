import { type ReactNode } from 'react';
interface GenerateReportDialogProps {
    onGenerate?: () => Promise<any>;
    onSuccess?: (report: any) => void;
    trigger?: ReactNode;
    isPending?: boolean;
    isSuccess?: boolean;
    isError?: boolean;
    onReset?: () => void;
    labels?: {
        trigger?: string;
        title?: string;
        description?: string;
        includes?: {
            title?: string;
            metrics?: string;
            strengths?: string;
            recommendations?: string;
            patterns?: string;
            score?: string;
        };
        buttons?: {
            cancel?: string;
            generate?: string;
            close?: string;
            retry?: string;
        };
        loading?: {
            title?: string;
            description?: string;
        };
        success?: {
            title?: string;
            description?: string;
        };
        error?: string;
    };
}
export declare function GenerateReportDialog({ onGenerate, onSuccess, trigger, isPending, isSuccess, isError, onReset, labels, }: GenerateReportDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=generate-report-dialog.d.ts.map