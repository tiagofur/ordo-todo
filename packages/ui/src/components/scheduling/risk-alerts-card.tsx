import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Button } from '../ui/button.js';

export type RiskAlertKind = 'overload' | 'deadline-at-risk';

export type RiskAlertAction =
  | 'reschedule'
  | 'split-task'
  | 'delegate'
  | 'renegotiate'
  | 'freeze-less'
  | 'extend-day';

export interface RiskAlertOption {
  label: string;
  action: RiskAlertAction;
}

export interface RiskAlertsCardRisk {
  kind: RiskAlertKind;
  taskIds: string[];
  message: string;
  options: RiskAlertOption[];
}

export interface RiskAlertsCardLabels {
  title: string;
  empty: string;
  overload: string;
  deadlineAtRisk: string;
}

interface RiskAlertsCardProps {
  risks: RiskAlertsCardRisk[];
  labels: RiskAlertsCardLabels;
  onSelectOption: (taskIds: string[], action: RiskAlertAction) => void;
}

/**
 * Presentational risk-alerts card (<150 lines). No fetching: the container
 * passes risks (GET tasks/day-plan/risks, T4b shape) + labels + callback.
 * Options are read-only until the ritual (006) wires real actions.
 */
export function RiskAlertsCard({
  risks,
  labels,
  onSelectOption,
}: RiskAlertsCardProps) {
  const kindLabel = (kind: RiskAlertKind): string =>
    kind === 'overload' ? labels.overload : labels.deadlineAtRisk;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <CardTitle className="text-sm">{labels.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {risks.length === 0 ? (
          <p className="text-xs text-muted-foreground">{labels.empty}</p>
        ) : (
          <ul className="space-y-2">
            {risks.map((risk, i) => (
              <li
                key={`${risk.kind}-${risk.taskIds.join(',')}-${i}`}
                className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2"
              >
                <p className="text-sm font-medium">
                  {kindLabel(risk.kind)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {risk.message}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {risk.options.map((option) => (
                    <Button
                      key={option.action}
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectOption(risk.taskIds, option.action)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
