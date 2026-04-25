export const PRIORITY = {
  HIGH: 1,
  MEDIUM: 2,
  NORMAL: 3,
  LOW: 4,
} as const;

export const PRIORITY_LABELS: Record<number, string> = {
  [PRIORITY.HIGH]: 'High',
  [PRIORITY.MEDIUM]: 'Medium',
  [PRIORITY.NORMAL]: 'Normal',
  [PRIORITY.LOW]: 'Low',
};

export function priorityToString(priority: number): string {
  const map: Record<number, string> = {
    [PRIORITY.HIGH]: 'high',
    [PRIORITY.MEDIUM]: 'medium',
    [PRIORITY.NORMAL]: 'normal',
    [PRIORITY.LOW]: 'low',
  };
  return map[priority] ?? 'low';
}

export const CLASSIFICATION = {
  MAJOR: 1,
  SIGNIFICANT: 2,
  STANDARD: 3,
  NORMAL: 4,
} as const;

export const CLASSIFICATION_LABELS: Record<number, string> = {
  [CLASSIFICATION.MAJOR]: 'Major',
  [CLASSIFICATION.SIGNIFICANT]: 'Significant',
  [CLASSIFICATION.STANDARD]: 'Standard',
  [CLASSIFICATION.NORMAL]: 'Normal',
};

export const TICKET_STATUS = {
  LOGGED: 'loged',
  PROGRESS: 'progress',
  HOLD: 'hold',
  FULFILLED: 'fulfilled',
  CANCELED: 'canceled',
} as const;

export const TICKET_STATUS_OPTIONS = [
  { value: TICKET_STATUS.LOGGED, label: 'Logged' },
  { value: TICKET_STATUS.FULFILLED, label: 'Fulfilled' },
  { value: TICKET_STATUS.PROGRESS, label: 'Progress' },
  { value: TICKET_STATUS.HOLD, label: 'On hold' },
  { value: TICKET_STATUS.CANCELED, label: 'Canceled' },
];

export const CR_STATUS = {
  APPROVED: 'approved',
  IMPLEMENTED: 'implemented',
  REQUESTED: 'requested',
  PENDING_APPROVAL: 'pending approval',
  CANCELLED: 'cancelled',
} as const;

export const CR_STATUS_OPTIONS = [
  { value: CR_STATUS.APPROVED, label: 'Approved' },
  { value: CR_STATUS.IMPLEMENTED, label: 'Implemented' },
  { value: CR_STATUS.REQUESTED, label: 'Requested' },
  { value: CR_STATUS.PENDING_APPROVAL, label: 'Pending approval' },
  { value: CR_STATUS.CANCELLED, label: 'Cancelled' },
];

export const TICKET_FILTER_OPTIONS = [
  { label: 'loged', value: TICKET_STATUS.LOGGED },
  { label: 'progress', value: TICKET_STATUS.PROGRESS },
  { label: 'hold', value: TICKET_STATUS.HOLD },
  { label: 'fulfilled', value: TICKET_STATUS.FULFILLED },
];

export const TICKET_SORT_OPTIONS = [
  { label: 'Sort by status asc', value: 'status-asc' },
  { label: 'Sort by status desc', value: 'status-desc' },
  { label: 'Sort by priority asc', value: 'priority-asc' },
  { label: 'Sort by priority desc', value: 'priority-desc' },
];

export const CR_SORT_OPTIONS = [
  { label: 'Sort by status asc', value: 'status-asc' },
  { label: 'Sort by status desc', value: 'status-desc' },
  { label: 'Sort by classification asc', value: 'classification-asc' },
  { label: 'Sort by classification desc', value: 'classification-desc' },
];

export const PRIORITY_SELECT_OPTIONS = [
  { value: PRIORITY.NORMAL, label: PRIORITY_LABELS[PRIORITY.NORMAL] },
  { value: PRIORITY.HIGH, label: PRIORITY_LABELS[PRIORITY.HIGH] },
  { value: PRIORITY.LOW, label: PRIORITY_LABELS[PRIORITY.LOW] },
  { value: PRIORITY.MEDIUM, label: PRIORITY_LABELS[PRIORITY.MEDIUM] },
];

export const IMPACT_OPTIONS = [
  { value: 'one', label: '1 User' },
  { value: 'two', label: '2 Users' },
  { value: 'many', label: 'Many Users' },
];

export const CLASSIFICATION_SELECT_OPTIONS = [
  { value: CLASSIFICATION.STANDARD, label: CLASSIFICATION_LABELS[CLASSIFICATION.STANDARD] },
  { value: CLASSIFICATION.MAJOR, label: CLASSIFICATION_LABELS[CLASSIFICATION.MAJOR] },
  { value: CLASSIFICATION.SIGNIFICANT, label: CLASSIFICATION_LABELS[CLASSIFICATION.SIGNIFICANT] },
  { value: CLASSIFICATION.NORMAL, label: CLASSIFICATION_LABELS[CLASSIFICATION.NORMAL] },
];

export const CATEGORY_OPTIONS = [
  { value: 'software', label: 'Software' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'network', label: 'Network' },
  { value: 'servers', label: 'Servers' },
  { value: 'storage', label: 'Storage' },
  { value: 'exchange', label: 'Exchange' },
];

export const CR_FILTER_OPTIONS = [
  { label: 'requested', value: 'requested' },
  { label: 'pending approval', value: 'pending approval' },
  { label: 'approved', value: 'approved' },
  { label: 'implemented', value: 'implemented' },
];

export const DEADLINE = {
  URGENT_THRESHOLD: 1,
  NORMAL_THRESHOLD: 4,
} as const;

export const PAGE_SIZE = 10;

export const ROLES = {
  STANDARD: 'standard',
  ANALYST: 'analyst',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
