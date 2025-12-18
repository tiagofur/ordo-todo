interface FocusScoreGaugeProps {
    /** Focus score from 0 to 1 */
    score: number;
    /** Custom labels for i18n */
    labels?: {
        label?: string;
        description?: string;
        excellent?: string;
        veryGood?: string;
        good?: string;
        moderate?: string;
        low?: string;
        needsImprovement?: string;
    };
    className?: string;
}
/**
 * FocusScoreGauge - Platform-agnostic circular gauge for focus score
 *
 * @example
 * <FocusScoreGauge
 *   score={0.75}
 *   labels={{ label: t('label'), excellent: t('excellent') }}
 * />
 */
export declare function FocusScoreGauge({ score, labels, className, }: FocusScoreGaugeProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=focus-score-gauge.d.ts.map