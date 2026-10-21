export interface RitualEveningTaskItem {
  taskId: string;
  title: string;
}

export type RitualEveningDestination = 'tomorrow' | 'date' | 'archived';
export type RitualEveningReason = 'overran' | 'urgent' | 'no-energy' | 'other';

export interface RitualEveningMove {
  taskId: string;
  destination: RitualEveningDestination;
  date?: string;
  reason: RitualEveningReason;
}

export interface EveningRitualCardLabels {
  title: string;
  summaryTitle: string;
  summaryEmpty: string;
  completedTitle: string;
  completedEmpty: string;
  pendingTitle: string;
  pendingEmpty: string;
  destinationTomorrow: string;
  destinationDate: string;
  destinationArchived: string;
  reasonOverran: string;
  reasonUrgent: string;
  reasonNoEnergy: string;
  reasonOther: string;
  complete: string;
  skip: string;
  completed: string;
  skipped: string;
  shutdown: string;
  datePlaceholder: string;
}
