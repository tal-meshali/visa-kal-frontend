export const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  submitted: "#3b82f6",
  approved: "#10b981",
  rejected: "#ef4444",
  pending_payment: "#f59e0b",
  pending_approval: "#3b82f6",
};

export const DEFAULT_STATUS_COLOR = "#64748b";

export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] || DEFAULT_STATUS_COLOR;
};


