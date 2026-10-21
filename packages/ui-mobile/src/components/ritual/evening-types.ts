export interface MobileEveningTask {
  taskId: string;
  title: string;
}

export type MobileEveningDestination = 'tomorrow' | 'date' | 'archived';
export type MobileEveningReason = 'overran' | 'urgent' | 'no-energy' | 'other';

export interface MobileEveningMove {
  taskId: string;
  destination: MobileEveningDestination;
  date?: string;
  reason: MobileEveningReason;
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
