import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Button } from '../ui/button.js';

export interface RiskAlertOption {
  id: string;
  label: string;
}

export interface RiskAlertsCardRisk {
  id: string;
  taskId?: string;
  title: string;
  detail: string;
  options: RiskAlertOption[];
}

export interface RiskAlertsCardLabels {
  title: string;
  empty: string;
}

interface RiskAlertsCardProps {
  risks: RiskAlertsCardRisk[];
  labels: RiskAlertsCardLabels;
  onSelectOption: (riskId: string, optionId: string) => void;
}

/**
 * Presentational risk-alerts card (<150 lines). No fetching: the container
 * passes risks + labels + callback. Data arrives with T4b
 * (GET tasks/day-plan/risks); until then the web container hides this
 * card (graceful degradation) — see useDayPlanRisks.
 */
export function RiskAlertsCard({
  risks,
  labels,
  onSelectOption,
}: RiskAlertsCardProps) {
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
            {risks.map((risk) => (
              <li
                key={risk.id}
                className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2"
              >
                <p className="text-sm font-medium">{risk.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {risk.detail}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {risk.options.map((option) => (
                    <Button
                      key={option.id}
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectOption(risk.id, option.id)}
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
